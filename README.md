# CV ATS Grader — Gemini Version (Free Tier)

Same app as the Claude version, but powered by **Google Gemini 1.5 Flash** which has a **generous free tier** — no credit card required.

## Free Tier Limits (Gemini 1.5 Flash)

| Limit | Amount |
|---|---|
| Requests per minute | 15 |
| Requests per day | 1,500 |
| Tokens per minute | 1,000,000 |

For personal use this is effectively unlimited at no cost.

---

## Setup

### 1. Get your free Gemini API key

1. Go to **[aistudio.google.com](https://aistudio.google.com)**
2. Sign in with your Google account
3. Click **Get API key** → **Create API key**
4. Copy the key — it starts with `AIza...`

No billing, no credit card needed.

### 2. Install and run locally

```bash
git clone <your-repo-url>
cd cv-ats-app-gemini
npm install
cd netlify/functions && npm install && cd ../..
```

Create a `.env` file:
```
GEMINI_API_KEY=AIza-your-key-here
```

Run with Netlify CLI:
```bash
npm install -g netlify-cli
netlify dev
```

---

## Deploy to Netlify

1. Push to GitHub
2. **Netlify → Add new site → Import from Git** → select repo
3. **Site settings → Environment variables** → add:
   ```
   GEMINI_API_KEY = AIza-your-key-here
   ```
4. Deploy ✓

---

## Differences from Claude version

| | Claude version | Gemini version |
|---|---|---|
| API key env var | `ANTHROPIC_API_KEY` | `GEMINI_API_KEY` |
| Model | claude-sonnet-4 | gemini-1.5-flash |
| Free tier | Limited credits | 1,500 req/day free |
| Cost after free | ~$0.01–0.02/analysis | Free up to limits |
| Functions package | `@anthropic-ai/sdk` | `@google/generative-ai` |

The frontend is **identical** — same UI, same components, same behavior.

---

## Project Structure

```
cv-ats-app-gemini/
├── index.html
├── vite.config.js
├── netlify.toml
├── package.json
├── src/                    ← identical to Claude version
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   └── components/
│       ├── Header.jsx
│       ├── InputStep.jsx
│       ├── ScoreReport.jsx
│       └── RescoredReport.jsx
└── netlify/
    └── functions/
        ├── package.json    ← @google/generative-ai
        ├── grade.js        ← Gemini grading
        └── improve.js      ← Gemini improvement
```
