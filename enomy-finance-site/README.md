# Enomy Finance Site

A premium, frontend-only fintech website for **Enomy Finance** built with pure HTML, CSS, and JavaScript. It includes a modern landing page, UI-only dashboard preview, and a working real-time currency converter.

## Features

- Premium landing page with smooth scrolling and animated stats
- Responsive design (mobile, tablet, desktop)
- Glassmorphism cards, rounded components, soft shadows, hover interactions
- Real-time currency converter with supported currencies:
  - GBP, USD, EUR, BRL, JPY, TRY
- API-driven exchange rates with local caching (localStorage)
- Error handling for API/network failures
- Chart.js visualizations for trend snapshots
- 100% browser-only: no backend and no build step

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Tailwind CSS (CDN)
- Chart.js (CDN)
- Google Fonts (Inter + Poppins)
- Exchange Rate API: [open.er-api.com](https://open.er-api.com)

## Project Structure

```
enomy-finance-site
│
├── index.html
├── converter.html
├── dashboard.html
│
├── css
│   └── styles.css
│
├── js
│   ├── app.js
│   └── currency.js
│
├── assets
│   ├── logo.svg
│   └── icons
│
└── README.md
```

## Run Locally

No installation is required.

- Option 1: Open `index.html` directly in your browser.
- Option 2 (recommended): serve the folder with a static server to avoid browser CORS issues in some environments.

## GitHub Pages Deployment

1. Create a new GitHub repository.
2. Upload the contents of `enomy-finance-site` to the repository root (or configure Pages to that folder).
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select `main` branch and `/ (root)` folder.
6. Save. Your site will go live on the generated GitHub Pages URL.

## API Used

- Exchange rates endpoint example:
  - `https://open.er-api.com/v6/latest/USD`

## Future Features

- Database integration for user preferences and conversion history
- Full login/signup flows
- Personalized dashboards and financial recommendations
- Additional tools: budgeting assistant, investment trackers, alerts
