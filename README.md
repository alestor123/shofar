# Shofar

A lightweight, serverless API for real-time detection and summarization of global events (disasters, conflicts, emergencies) using scraped data from Google News and Twitter (via Nitter). Built for easy deployment on Vercel.

---

## Features

- Scrapes Google News and Twitter (Nitter) for disaster and crisis signals
- Outputs clean, structured JSON for dashboards, alerting, and research
- Minimal infrastructure: Vercel Functions + in-memory caching
- No AI/ML dependencies

---

## Installation

```bash
# Clone the repository
$ git clone https://github.com/yourusername/shofar.git
$ cd shofar

# Install dependencies
$ npm install
```

---

## Usage

### Local Development

```bash
# Start the local dev server
$ vercel dev
```

### Deploy to Vercel

1. Push your code to GitHub.
2. Import the repo in [Vercel Dashboard](https://vercel.com/import).
3. Deploy!

---

## API Endpoints

All endpoints return JSON.

| Endpoint                | Description                       |
|------------------------|-----------------------------------|
| `/api/v1/health`       | Health check                      |
| `/api/v1/news`         | Latest disaster news (Google News)|
| `/api/v1/tweets`       | Latest disaster tweets (Nitter)   |

---

## Example Response

```json
[
  {
    "title": "Earthquake hits City X",
    "source": "Google News",
    "url": "https://news.example.com/article",
    "published": "2025-06-04T12:00:00Z",
    "description": "A strong earthquake...",
    "thumbnail": "https://.../image.jpg"
  }
]
```

---

## Project Structure

- `api/v1/` — API endpoints (health, news, tweets)
- `utils/v1/lib/` — Core logic, datasources, services, utils, config
- `assets/json/keywords.json` — Disaster and emergency keywords

---

## License

MIT
