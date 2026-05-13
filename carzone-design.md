# CARZONE — Dark Design Spec

> Dark gray vibe · Luxury automotive marketplace · Desktop-first

---

## Color Palette

| Token | Value | Kullanım |
|---|---|---|
| `--bg-base` | `#0e0e0e` | Sayfa arka planı |
| `--bg-card` | `#161616` | Kart yüzeyi |
| `--bg-card-2` | `#1c1c1c` | Input, secondary surface |
| `--bg-hover` | `#222222` | Hover state |
| `--border` | `rgba(255,255,255,0.07)` | Default border |
| `--border-mid` | `rgba(255,255,255,0.12)` | Emphasized border |
| `--text-1` | `#f0f0f0` | Primary text |
| `--text-2` | `#8a8a8a` | Secondary / muted |
| `--text-3` | `#555555` | Placeholder / hint |
| `--accent` | `#6effa0` | Mint green — CTA, featured, hover |
| `--accent-dim` | `rgba(110,255,160,0.08)` | Accent surface tint |

---

## Typography

| Role | Font | Weight | Size |
|---|---|---|---|
| Logo / Display | `Syne` | 800 | 15px (nav), 22px (headings) |
| Card Title | `Syne` | 700 | 16–18px |
| Body / UI | `DM Sans` | 300–500 | 13–14px |
| Stats / Mono | `DM Mono` | 400–500 | 10–13px |

> Letter-spacing: logo `0.25em`, filter labels `0.12em`, stats `0.04em`

---

## Layout

```
┌─────────────────────────────────────────────────────┐
│  NAV  (sticky, 60px, backdrop-blur)                 │
├──────────────┬──────────────────────────────────────┤
│              │                                      │
│  SIDEBAR     │  MAIN                                │
│  240px       │  2-col card grid                     │
│  sticky      │                                      │
│              │                                      │
└──────────────┴──────────────────────────────────────┘
```

- Grid: `240px 1fr`
- Card grid: `repeat(2, 1fr)`, gap `1.25rem`
- Border-radius: cards `18px`, pills `8px`, inputs `10px`

---

## Navigation

- Background: `rgba(14,14,14,0.92)` + `backdrop-filter: blur(12px)`
- Border bottom: `1px solid var(--border)`
- Logo: centered, `Syne 800`, letter-spacing `0.25em`
- Nav links: left-aligned, `13px DM Sans`, active = `color: --text-1`
- Icon buttons: `34×34px`, border `1px solid --border-mid`, radius `8px`

---

## Sidebar — Filters

### Search Input
- Background: `--bg-card-2`
- Border: `1px solid --border`, focus → `--border-mid`
- Icon: left-padded, `--text-3`

### Section Label
- Font: `DM Mono`, `10px`, `letter-spacing: 0.12em`
- Color: `--text-3`
- ALL CAPS

### Fuel Type Pills
| State | BG | Border | Text |
|---|---|---|---|
| Default | `#1f1f1f` | `--border` | `--text-2` |
| Active | `#f0f0f0` | `#f0f0f0` | `#0e0e0e` |
| Hover | — | `--border-mid` | `--text-1` |

### Price Range
- Track: `3px`, color `--border-mid`
- Fill: `--accent`
- Thumb: `12×12px`, circle, `--accent`
- Inputs: `DM Mono`, center-aligned, `--bg-card-2`

### Brand Checkboxes
| State | Checkbox BG | Text |
|---|---|---|
| Unchecked | transparent | `--text-2` |
| Checked | `--accent` | `--text-1`, weight 500 |

---

## Car Cards

### Default Card
- BG: `--bg-card`
- Border: `1px solid --border`
- Radius: `18px`
- Hover: `border → --border-mid`, `transform: translateY(-2px)`

### Featured Card
- BG: `linear-gradient(145deg, #131a14, #161616)`
- Border: `rgba(110,255,160,0.2)`, hover → `0.35`
- Watermark: model adı, `Syne 800`, `90px`, `rgba(110,255,160,0.04)`
- Accent dot: `6px`, `--accent`, pulse animasyon

### Card Anatomy
```
┌─────────────────────────────────────┐
│  Model Adı          Fiyat  [↗]      │  ← header padding 1.25rem
│  Fuel Type                          │
│                                     │
│          [CAR IMAGE]                │  ← 180–210px height
│                                     │
├──────────────┬──────────┬───────────┤
│  400 Нм      │  3.9 s   │ 220 km/h │  ← stat row
│  Max Torque  │ 0–100    │ Top Speed │
└──────────────┴──────────┴───────────┘
```

### Car Image
- `object-fit: contain`
- `filter: drop-shadow(0 20px 40px rgba(0,0,0,0.6))`
- Hover: `scale(1.04) translateY(-4px)`, transition `0.35s`

### Price
- Default: `Syne 700`, `17px`, `--text-1`
- Featured: `--accent`

### Arrow Button `[↗]`
- `30×30px`, border `--border-mid`, radius `8px`, BG `--bg-hover`
- Card hover: BG → `--accent`, border → `--accent`, icon → `#0e0e0e`

### Stat Row
- Border top: `1px solid --border`
- Her stat: `flex: 1`, border-right (son hariç)
- Value: `DM Mono 500`, `13px`, `--text-1`
- Label: `10px`, `--text-3`, letter-spacing `0.04em`

---

## Animations

| Efekt | Değer |
|---|---|
| Card hover lift | `transform: translateY(-2px)`, `0.25s ease` |
| Car image zoom | `scale(1.04) translateY(-4px)`, `0.35s ease` |
| Arrow btn fill | color/bg transition `0.2s` |
| Accent dot pulse | opacity `1 → 0.4 → 1`, `2s infinite` |
| Nav blur | `backdrop-filter: blur(12px)` |

---

## Top Bar

- `"In Stock (27)"` — `Syne 700 22px`, count muted `--text-2`
- Sort button: `DM Sans 13px`, border `--border-mid`, radius `9px`, BG `--bg-card`
- View toggle buttons: `34×34px`, active state → `--bg-card-2`, border `--border-mid`

---

## Genel Kurallar

- Hiçbir yerde beyaz/açık arka plan yok
- Gradient sadece featured card'da, minimal
- Shadow yerine `drop-shadow` kullan (görseller için)
- Border her zaman `rgba` tabanlı, asla solid opaque renk değil
- Accent rengi (`#6effa0`) sadece 3 yerde: featured price, checkbox checked, hover CTA
- Scrollbar: `4px`, `--border-mid`, transparent track
