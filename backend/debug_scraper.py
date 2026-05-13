"""Run with: .venv/bin/python debug_scraper.py"""
import asyncio, json
from playwright.async_api import async_playwright

URL = "https://www.autoscout24.com/lst/mazda/mx-5?atype=C&cy=NL&ustate=N,U&sort=standard&desc=0&damaged_listing=exclude"

async def main():
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True, args=["--disable-blink-features=AutomationControlled"])
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            locale="nl-NL",
        )
        await context.add_init_script("Object.defineProperty(navigator,'webdriver',{get:()=>undefined})")
        page = await context.new_page()
        await page.goto(URL, wait_until="domcontentloaded")
        await page.wait_for_timeout(3000)

        raw = await page.evaluate("() => document.getElementById('__NEXT_DATA__')?.textContent")
        data = json.loads(raw)
        listings = data["props"]["pageProps"]["listings"]

        first = listings[0]
        print("=== price ===")
        print(json.dumps(first.get("price"), indent=2))
        print("\n=== vehicle ===")
        print(json.dumps(first.get("vehicle"), indent=2))
        print("\n=== vehicleDetails ===")
        print(json.dumps(first.get("vehicleDetails"), indent=2))
        print("\n=== location ===")
        print(json.dumps(first.get("location"), indent=2))
        print("\n=== seller ===")
        print(json.dumps(first.get("seller"), indent=2))
        print("\n=== url ===")
        print(first.get("url"))

        await browser.close()

asyncio.run(main())
