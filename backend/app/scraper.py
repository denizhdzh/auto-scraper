"""
AutoScout24 scraper — reads __NEXT_DATA__ JSON from search pages,
then enriches with detail page data (curb weight, description, color).
"""
import asyncio
import json
import re
from typing import Optional, Callable
import httpx
from playwright.async_api import async_playwright, Page, BrowserContext

from .models import VehicleSpec, SearchParams

BASE_URL = "https://www.autoscout24.com"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "nl-NL,nl;q=0.9,en;q=0.8",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

FUEL_MAP = {
    "benzin": "B", "petrol": "B", "gasoline": "B",
    "dizel": "D", "diesel": "D",
    "elektrik": "E", "electric": "E",
    "hibrit": "H", "hybrid": "H",
}

BODY_MAP = {
    "compact":     "1",
    "convertible": "2",
    "coupe":       "3",
    "suv":         "4",
    "sedan":       "6",
}


# ---------------------------------------------------------------------------
# URL builder
# ---------------------------------------------------------------------------

def _build_search_url(params: SearchParams, page: int = 1, query_id: str | None = None) -> str:
    make = (params.make or "").lower().replace(" ", "-")
    model = (params.model or "").lower().replace(" ", "-")
    path = "/lst"
    if make:
        path += f"/{make}"
    if model:
        path += f"/{model}"

    query: dict[str, str] = {
        "atype": "C",
        "cy": params.country or "NL",
        "damaged_listing": "exclude",
        "desc": "0",
        "page": str(page),
        "powertype": "kw",
        "sort": "standard",
        "ustate": "N,U",
    }
    if params.year_min:   query["fregfrom"]  = str(params.year_min)
    if params.year_max:   query["fregto"]    = str(params.year_max)
    if params.price_min:  query["pricefrom"] = str(params.price_min)
    if params.price_max:  query["priceto"]   = str(params.price_max)
    if params.mileage_max: query["kmto"]     = str(params.mileage_max)
    if params.power_min:
        query["powerfrom"] = str(int(params.power_min * 0.7355))
    if params.fuel_type:
        key = params.fuel_type.lower()
        if key in FUEL_MAP:
            query["fuel"] = FUEL_MAP[key]
    if params.body_type:
        codes = [BODY_MAP[k] for k in params.body_type.lower().split(',') if k in BODY_MAP]
        if codes:
            query["body"] = ",".join(codes)
    if query_id:
        query["search_id"] = query_id
        query["source"] = "listpage_pagination"

    qs = "&".join(f"{k}={v}" for k, v in query.items())
    return f"{BASE_URL}{path}?{qs}"


# ---------------------------------------------------------------------------
# Parsing helpers
# ---------------------------------------------------------------------------

def _parse_num(text: str | None) -> Optional[float]:
    if not text:
        return None
    cleaned = re.sub(r"[^\d.,]", "", text).replace(",", "")
    try:
        return float(cleaned)
    except ValueError:
        return None


def _get_detail(details: list[dict], aria: str) -> Optional[str]:
    for d in details or []:
        if d.get("ariaLabel", "").lower() == aria.lower():
            return d.get("data")
    return None


def _extract_hp(text: str | None) -> Optional[int]:
    if not text:
        return None
    m = re.search(r'(\d+)\s*(?:hp|ps|cv|pk)', text, re.IGNORECASE)
    if m:
        return int(m.group(1))
    m = re.search(r'(\d+)\s*kW', text, re.IGNORECASE)
    if m:
        return round(int(m.group(1)) * 1.341)
    return None


def _extract_year(text: str | None) -> Optional[int]:
    if not text:
        return None
    m = re.search(r'(19|20)\d{2}', text)
    return int(m.group()) if m else None


def _full_image(url: str) -> str:
    return re.sub(r'/\d+x\d+[\w.]+$', '/800x600.jpg', url)


# ---------------------------------------------------------------------------
# Detail page enrichment via httpx (curb weight, description, color)
# ---------------------------------------------------------------------------

async def _fetch_detail(url: str, client: httpx.AsyncClient) -> dict:
    """Fetch curb weight + description from a detail page via __NEXT_DATA__."""
    try:
        headers_with_ref = {**HEADERS, "Referer": "https://www.autoscout24.com/lst/"}
        resp = await client.get(url, timeout=15, follow_redirects=True, headers=headers_with_ref)
        m = re.search(
            r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>',
            resp.text, re.DOTALL
        )
        if not m:
            return {}
        data = json.loads(m.group(1))
        props = data.get("props", {}).get("pageProps", {})

        # AutoScout24 detail page structure (may vary by locale/version)
        listing = (
            props.get("listingDetails")
            or props.get("listing")
            or props.get("ad")
            or props.get("adDetails")
            or props.get("vehicle")
            or {}
        )
        vehicle = listing.get("vehicle") or listing.get("vehicleDetails") or {}
        details = (
            listing.get("vehicleDetails")
            or listing.get("technicalData")
            or vehicle.get("technicalData")
            or vehicle.get("vehicleDetails")
            or props.get("vehicleDetails")
            or []
        )
        if isinstance(details, dict):
            details = list(details.values()) if details else []

        result: dict = {}

        # ── Curb weight ──────────────────────────────────────────────────────
        # Primary: vehicle.weight = "976 kg"
        w_str = vehicle.get("weight") or ""
        if w_str:
            w = _parse_num(w_str)
            if w and 500 <= w <= 4000:
                result["curb_weight_kg"] = int(w)

        # Secondary: listing.emptyWeight.formatted = "976 kg"
        if "curb_weight_kg" not in result:
            ew = (listing.get("emptyWeight") or {})
            w_str = ew.get("formatted") or ew.get("value") or ""
            if w_str:
                w = _parse_num(w_str)
                if w and 500 <= w <= 4000:
                    result["curb_weight_kg"] = int(w)

        # Tertiary: iterate vehicleDetails/technicalData array (older structure)
        if "curb_weight_kg" not in result:
            weight_labels = [
                "leergewicht", "curb weight", "kerb weight",
                "leeggewicht", "unladen weight", "empty weight",
            ]
            for d in details:
                label = (d.get("ariaLabel") or d.get("label") or "").lower()
                if any(wl in label for wl in weight_labels):
                    w = _parse_num(d.get("data") or d.get("value"))
                    if w and 500 <= w <= 4000:
                        result["curb_weight_kg"] = int(w)
                    break

        # Last resort: HTML regex
        if "curb_weight_kg" not in result:
            html_m = re.search(
                r'(?:Leergewicht|Curb\s*weight|Kerb\s*weight|leeggewicht|emptyWeight)'
                r'[^0-9]{0,40}?(\d{3,4})',
                resp.text, re.IGNORECASE
            )
            if html_m:
                w = int(html_m.group(1))
                if 500 <= w <= 4000:
                    result["curb_weight_kg"] = w

        # ── Description ──────────────────────────────────────────────────────
        desc = (
            listing.get("description")
            or listing.get("freeText")
            or vehicle.get("marketingDescription")
            or vehicle.get("description")
        )
        if desc:
            result["description"] = str(desc)[:1000]

        # ── Color ─────────────────────────────────────────────────────────────
        color = (
            vehicle.get("bodyColor")
            or vehicle.get("color")
            or vehicle.get("exteriorColor")
            or _get_detail(details, "Colour")
            or _get_detail(details, "Color")
            or _get_detail(details, "Kleur")
        )
        if color:
            result["color"] = color

        # ── Doors / seats ─────────────────────────────────────────────────────
        if vehicle.get("numberOfDoors"):
            result["doors"] = int(_parse_num(str(vehicle["numberOfDoors"])) or 0) or None
        if vehicle.get("numberOfSeats"):
            result["seats"] = int(_parse_num(str(vehicle["numberOfSeats"])) or 0) or None

        for d in details:
            label = (d.get("ariaLabel") or "").lower()
            val = d.get("data") or ""
            if "door" in label:
                result["doors"] = int(_parse_num(val) or 0) or None
            elif "seat" in label:
                result["seats"] = int(_parse_num(val) or 0) or None

        return result

    except Exception as e:
        print(f"  Detail fetch error for {url}: {e}")
        return {}


async def _enrich_vehicles(
    vehicles: list[VehicleSpec],
    on_progress: Callable = None,
    concurrency: int = 4,
) -> list[VehicleSpec]:
    """Fetch detail pages for all vehicles to get curb weight etc."""
    sem = asyncio.Semaphore(concurrency)

    async def enrich_one(v: VehicleSpec, client: httpx.AsyncClient, idx: int) -> VehicleSpec:
        async with sem:
            detail = await _fetch_detail(v.listing_url, client)
            if detail:
                for field, val in detail.items():
                    if val is not None and getattr(v, field, None) is None:
                        object.__setattr__(v, field, val)
            if on_progress:
                await on_progress(idx + 1, len(vehicles))
            return v

    async with httpx.AsyncClient(headers=HEADERS) as client:
        tasks = [enrich_one(v, client, i) for i, v in enumerate(vehicles)]
        return list(await asyncio.gather(*tasks))


# ---------------------------------------------------------------------------
# Parse one listing from __NEXT_DATA__ search results
# ---------------------------------------------------------------------------

def _parse_listing(raw: dict, default_make: str, default_model: str) -> Optional[VehicleSpec]:
    try:
        v = raw.get("vehicle") or {}
        details = raw.get("vehicleDetails") or []
        loc = raw.get("location") or {}
        seller = raw.get("seller") or {}
        price_obj = raw.get("price") or {}

        price = _parse_num(price_obj.get("priceFormatted"))
        if not price or price <= 0:
            return None

        mileage_str = v.get("mileageInKm") or _get_detail(details, "Mileage") or ""
        mileage = int(_parse_num(mileage_str) or 0)

        first_reg = _get_detail(details, "First registration")
        year = _extract_year(first_reg)
        if not year:
            return None

        power_hp = _extract_hp(_get_detail(details, "Power"))
        if not power_hp:
            kw_str = v.get("powerInKw") or v.get("rawPowerInKw") or ""
            kw = _parse_num(str(kw_str))
            if kw:
                power_hp = round(kw * 1.341)
            else:
                hp_str = v.get("powerInHp") or v.get("rawPowerInHp") or ""
                power_hp = int(_parse_num(str(hp_str)) or 0) or None

        engine_cc = int(_parse_num(
            v.get("engineDisplacementInCCM")
            or v.get("rawDisplacementInCCM")
            or v.get("rawCylinderCapacity")
            or v.get("displacementInCCM")
            or ""
        ) or 0) or None

        city = loc.get("city", "")
        country = loc.get("countryCode", "")
        location = f"{city}, {country}".strip(", ") or None

        seller_type_raw = (seller.get("type") or "").lower()
        seller_type = "private" if "private" in seller_type_raw else "dealer" if seller_type_raw else None

        images = [_full_image(u) for u in (raw.get("images") or [])[:10]]

        url_path = raw.get("url") or ""
        listing_url = f"{BASE_URL}{url_path}" if url_path.startswith("/") else url_path

        return VehicleSpec(
            make=v.get("make") or default_make.title(),
            model=v.get("model") or default_model.upper(),
            year=year,
            price=price,
            mileage=mileage,
            fuel_type=(
                v.get("fuel")
                or (v.get("fuelCategory") or {}).get("formatted")
                or (v.get("primaryFuel") or {}).get("formatted")
                or (v.get("allFuelTypes") or [{}])[0].get("formatted")
            ),
            transmission=(
                v.get("transmission")
                or v.get("transmissionType")
                or v.get("gearType")
            ),
            power_hp=power_hp,
            engine_cc=engine_cc,
            curb_weight_kg=None,
            seller_type=seller_type,
            location=location,
            listing_url=listing_url,
            image_urls=images,
            first_registration=first_reg,
        )
    except Exception as e:
        print(f"Parse error: {e}")
        return None


# ---------------------------------------------------------------------------
# Playwright page fetcher
# ---------------------------------------------------------------------------

async def _fetch_next_data(page: Page, url: str) -> Optional[dict]:
    await page.goto(url, wait_until="domcontentloaded", timeout=30000)
    try:
        await page.wait_for_selector("#__NEXT_DATA__", timeout=10000)
    except Exception:
        pass
    raw = await page.evaluate("() => document.getElementById('__NEXT_DATA__')?.textContent")
    if not raw:
        return None
    return json.loads(raw)


# ---------------------------------------------------------------------------
# Main entry
# ---------------------------------------------------------------------------

async def scrape_vehicles(
    params: SearchParams,
    on_progress: Callable = None,
    max_pages: int = 20,
) -> list[VehicleSpec]:
    results: list[VehicleSpec] = []

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(
            headless=True,
            args=["--disable-blink-features=AutomationControlled", "--no-sandbox"],
        )
        context: BrowserContext = await browser.new_context(
            user_agent=HEADERS["User-Agent"],
            viewport={"width": 1280, "height": 800},
            locale="nl-NL",
            extra_http_headers={"Accept-Language": "nl-NL,nl;q=0.9,en;q=0.8"},
        )
        await context.add_init_script(
            "Object.defineProperty(navigator,'webdriver',{get:()=>undefined});"
            "window.chrome={runtime:{}};"
        )
        page = await browser.new_page()

        total_listings = 0
        seen_ids: set[str] = set()
        make = params.make or ""
        model = params.model or ""
        search_id: str | None = None  # AS24 session token for pagination

        for pg in range(1, max_pages + 1):
            url = _build_search_url(params, page=pg, query_id=search_id)
            print(f"Fetching search page {pg}: {url}")

            data = await _fetch_next_data(page, url)
            if not data:
                print(f"  No __NEXT_DATA__ on page {pg}")
                break

            # Extract search_id from the actual browser URL after page load
            if not search_id:
                from urllib.parse import urlparse, parse_qs
                current_url = page.url
                parsed = parse_qs(urlparse(current_url).query)
                search_id = (
                    (parsed.get("search_id") or parsed.get("query_id") or [None])[0]
                )
                if search_id:
                    print(f"  Got search_id from URL: {search_id}")

            page_props = data.get("props", {}).get("pageProps", {})
            listings = page_props.get("listings") or []
            total = (
                page_props.get("numberOfResults")
                or page_props.get("totalCount")
                or page_props.get("totalResults")
                or page_props.get("count")
                or 0
            )
            n_pages = (
                page_props.get("numberOfPages")
                or page_props.get("totalPages")
                or page_props.get("pageCount")
                or page_props.get("pages")
                or 0
            )
            # Infer page count from total if metadata key is missing
            if not n_pages and total and listings:
                n_pages = max(1, -(-total // len(listings)))  # ceiling division

            # Also try extracting search_id from pageQuery JSON
            if not search_id:
                page_query = page_props.get("pageQuery") or {}
                search_id = page_query.get("search_id") or page_query.get("query_id")
                if search_id:
                    print(f"  Got search_id from pageQuery: {search_id}")

            if pg == 1:
                total_listings = total
                print(f"  Total: {total} results across {n_pages} pages")
                if on_progress:
                    await on_progress(0, total_listings)

            if not listings:
                print(f"  Empty listings on page {pg}, stopping")
                break

            before = len(results)
            for raw in listings:
                uid = str(raw.get("id") or raw.get("url") or "")
                if not uid or uid in seen_ids:
                    continue
                seen_ids.add(uid)
                v = _parse_listing(raw, make, model)
                if v and v.listing_url not in seen_ids:
                    seen_ids.add(v.listing_url)
                    results.append(v)

            print(f"  +{len(results) - before} new → {len(results)} total")
            if on_progress:
                await on_progress(len(results), total_listings)

            # Stop if we've collected everything or gone past last page
            if total and len(results) >= total:
                break
            if n_pages and pg >= n_pages:
                break

            await asyncio.sleep(1)

        await browser.close()

    # Phase 2: enrich with detail pages (curb weight, description, color)
    if results:
        print(f"Enriching {len(results)} vehicles with detail page data...")

        enriched_count = 0
        async def enrich_progress(done: int, total: int):
            nonlocal enriched_count
            enriched_count = done
            if on_progress:
                await on_progress(done, total)

        results = await _enrich_vehicles(results, on_progress=enrich_progress)
        found_weight = sum(1 for v in results if v.curb_weight_kg)
        print(f"Enrichment done. Curb weight found for {found_weight}/{len(results)} vehicles.")

    return results
