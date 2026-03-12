# Enomy Finance (GitHub Pages Static Site)

This repository contains a **frontend-only** static website for Enomy Finance.
It is designed to work directly on GitHub Pages with no backend, build tools, or local setup requirements.

## Features

- Root landing page with visible content (`index.html`)
- Inline SVG logo (no binary image files)
- Real-time currency converter (`converter.html`)
- Supported currencies: GBP, USD, EUR, BRL, JPY, TRY
- Local caching of exchange rates in `localStorage`
- Responsive fintech-style UI with Tailwind CDN + custom CSS

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript
- TailwindCSS via CDN
- Google Fonts (Inter)
- Exchange rate API: `https://open.er-api.com`

## Repository Structure

```text
/
index.html
converter.html
css/
    styles.css
js/
    currency.js
.nojekyll
README.md
```

## Deployment (GitHub Pages)

1. Create a GitHub repository.
2. Upload these files to the repository root.
3. Open **Settings → Pages**.
4. Set source to **Deploy from a branch**.
5. Select branch: **main**, folder: **/ (root)**.
6. Save and wait for Pages deployment.

## Notes

- `.nojekyll` is included to ensure GitHub Pages serves files directly.
- All paths are relative (for example `./js/currency.js`) for compatibility.
