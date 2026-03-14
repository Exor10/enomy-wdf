# Backend Migration Plan (Spring MVC + Spring Security + MySQL)

This repository is currently a static frontend prototype for GitHub Pages.

## Planned Backend Stack

- Spring MVC (REST endpoints)
- Spring Security (authentication, authorization, password handling, JWT/session)
- MySQL (persistent storage)

## Planned API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/quotes`
- `POST /api/quotes`
- `GET /api/transactions`
- `POST /api/transactions`
- `GET /api/investment-plans`
- `POST /api/investment-plans`

## Planned Data Models

### User
- id
- email
- passwordHash
- role
- createdAt

### Quote
- id
- userId
- name
- email
- sourceCurrency
- targetCurrency
- amount
- fee
- netAmount
- convertedAmount
- createdAt

### Transaction
- id
- userId
- sourceCurrency
- targetCurrency
- amount
- fee
- netAmount
- rate
- status
- createdAt

### SavedInvestmentPlan
- id
- userId
- planType
- initialLump
- monthlyInvestment
- projectionPayloadJson
- createdAt

## Frontend Integration Notes

Current JS modules are designed so localStorage operations can be replaced by API calls later:

- `js/storage.js` → replace with authenticated API service
- `js/converter-api.js` → route through backend proxy/service
- Protected actions currently show placeholder notices and should later require auth tokens

## Security Notes

- Static GitHub Pages cannot provide secure auth or data ownership.
- Final production implementation must enforce authorization in Spring Security.
