# AI Product Recommender

A React app that lets users describe what they're looking for in plain language, and uses OpenAI's GPT model to recommend matching products from a catalog.

## How it works
- A static catalog of 15 products (phones, laptops, headphones, wearables, tablets) is defined in `src/products.js`.
- The user enters their OpenAI API key (client-side, never stored) and a preference like "I want a phone under $500".
- The app sends the full product list + user query to OpenAI's `gpt-4o-mini` model, asking it to return the IDs of the best-matching products.
- Matched products are displayed at the top, with the full catalog shown below.

## Run locally
```
npm install
npm run dev
```

## Deploy to Vercel
1. Push this folder to a GitHub repo.
2. Go to vercel.com -> New Project -> Import the repo.
3. Framework preset: Vite (auto-detected). No environment variables needed since the API key is entered in the UI.
4. Deploy.

## Notes
- The OpenAI API key is entered directly in the UI for simplicity (no backend/serverless function needed for this assignment). In a production app, this call would be proxied through a backend to avoid exposing the key client-side.
- Model used: gpt-4o-mini (fast, cheap, sufficient for this matching task).
