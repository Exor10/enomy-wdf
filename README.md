# Enomy Finance (Static Frontend Prototype)

This repository is a GitHub Pages-friendly static prototype for Enomy Finance.

## What was added

- Improved currency converter with:
  - transaction validation (`min 300`, `max 5000`)
  - configurable fee rules
  - loading state, retry flow, and API fallback to cached rates
  - conversion summary (original, fee, net, converted)
- New savings & investment calculator (`savings.html`) with:
  - Basic Savings Plan
  - Savings Plan Plus
  - Managed Stock Investments
  - projections for 1, 5, and 10 years
  - fee/tax/profit estimates and visual progress summaries
- New activity page (`activity.html`) showing:
  - saved quotes
  - recent conversions
  - recent savings calculations
- New modular JS structure:
  - `js/storage.js`
  - `js/ui.js`
  - `js/validation.js`
  - `js/converter-api.js`
  - `js/currency.js`
  - `js/savings.js`
  - `js/activity.js`
- Backend migration plan docs at `docs/backend-plan.md`

## Fully implemented in this static site

- Frontend navigation and UI pages
- Currency conversion with API + local cache fallback
- Client-side validation and graceful error messages
- Demo persistence in browser localStorage
- Auth/authorization placeholders in UI

## Backend-dependent (not possible fully on GitHub Pages alone)

- Real authentication and authorization
- User-specific secure data ownership
- Database-backed persistence and audit history
- Secure quote/transaction APIs

Full brief-compliant production stack requires:

- Spring MVC
- Spring Security
- MySQL

## Demo localStorage persistence

This prototype stores demo-only data in browser localStorage:

- Contact info from saved quotes
- Saved quotes
- Recent currency conversions
- Recent savings calculations

This is intentionally temporary and prepared for replacement by backend APIs.

## Project Structure

```text
/
index.html
converter.html
savings.html
activity.html
css/
  styles.css
js/
  app.js
  storage.js
  ui.js
  validation.js
  converter-api.js
  currency.js
  savings.js
  activity.js
docs/
  backend-plan.md
.nojekyll
README.md
```

## Deploy to GitHub Pages

1. Create or open the GitHub repository.
2. Upload files to the repository root.
3. Go to **Settings → Pages**.
4. Choose **Deploy from a branch**.
5. Select **main** and **/ (root)**.
6. Save.

## Notes

- `.nojekyll` is included so GitHub Pages serves static files directly.
- All paths are relative (`./...`) to keep Pages compatibility.
