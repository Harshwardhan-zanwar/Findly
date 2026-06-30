# 🔍 Findly — AI-Powered Product Recommender

Findly lets users describe what they're looking for in plain English and uses LLM reasoning to instantly match and rank the best products from a catalog — no manual filtering, no dropdowns, just natural language.

Built with **React (Vite)**, **Vercel Serverless Functions**, and the **Groq API (`openai/gpt-oss-120b`)**.

---

## Features

- **Natural language matching** — type something like *"a fast-charging phone with AMOLED display under \$400"* and get ranked, relevant results.
- **Server-side API key** — the Groq key never reaches the browser; all LLM calls go through a Vercel serverless function (`/api/recommend`).
- **Clean, fast UI** — minimal dark-themed interface with loading and error states built in.
- **Easy to extend** — product catalog is a single static file (`src/products.js`); add or edit products without touching app logic.

---

## How it works

```
User types query
      ↓
React frontend (Vite) sends POST request with query + product catalog
      ↓
/api/recommend (Vercel serverless function)
      ↓
Formats prompt → calls Groq API (gpt-oss-120b) with server-side key
      ↓
Groq returns ranked product IDs as JSON
      ↓
Frontend matches IDs back to catalog and renders results
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite |
| Backend | Vercel Serverless Functions (Node.js) |
| LLM | Groq API — `openai/gpt-oss-120b` |
| Styling | CSS (custom, no framework) |

---

## Project Structure

```
├── api/
│   └── recommend.js      # Serverless function — calls Groq, keeps API key server-side
├── public/                # Static assets
├── src/
│   ├── App.jsx             # Main app logic and UI
│   ├── App.css             # Styling
│   ├── main.jsx             # React entry point
│   └── products.js         # Static product catalog
├── .env.local                # Local secret key (gitignored)
├── .gitignore
└── package.json
```

---

## Local Development

**1. Clone and install**
```bash
git clone https://github.com/Harshwardhan-zanwar/Findly.git
cd Findly
npm install
```

**2. Add your Groq API key**

Create `.env.local` in the project root:
```env
GROQ_API_KEY=your_groq_api_key_here
```

**3. Run with Vercel CLI**

Plain `vite dev` can't run the `/api` serverless function, so use the Vercel CLI instead — it runs the frontend and the API together, exactly as it behaves in production:
```bash
npm install -g vercel
vercel dev
```
Open the local URL it prints (typically `http://localhost:3000`).

---

## Notes
- The product catalog in `src/products.js` is static/dummy data for demo purposes; swap it for a real database or API as needed.
