<!-- SHOFAR: Real-Time Event Intelligence API -->



<h1 align="center">Shofar 📢</h1>

<p align="center">
  <b>A lightweight, serverless API for real-time detection and summarization of global events (disasters, conflicts, emergencies) using scraped data from Google News and Twitter (via Nitter).</b><br>
  <i>Built for easy deployment on Vercel.</i>
</p>

---

## ✨ Features

- 🌍 Scrapes Google News and Twitter (Nitter) for disaster and crisis signals
- 🧾 Outputs clean, structured JSON for dashboards, alerting, and research
- ⚡ Minimal infrastructure: Vercel Functions + in-memory caching
- 🔒 No AI/ML dependencies
- 🗂️ Simple dossier report endpoint (POC)

---

## 🚀 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/shofar.git
cd shofar

# Install dependencies
npm install
```

---

## 🛠️ Usage

### Local Development

```bash
vercel dev
```

### Deploy to Vercel

1. Push your code to GitHub.
2. Import the repo in [Vercel Dashboard](https://vercel.com/import).
3. Deploy!

---

## 📡 API Endpoints

All endpoints return JSON.

| Endpoint                | Method | Description                                 |
|------------------------|--------|---------------------------------------------|
| `/api/v1/health`       | GET    | Health check                                |
| `/api/v1/news`         | GET    | Latest disaster news (Google News)          |
| `/api/v1/tweets`       | GET    | Latest disaster tweets (Nitter)             |
| `/api/v1/dossier`      | POST   | Generate a simple event dossier report (POC)|

---

## 🧪 Example Response

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

## 🗂️ Dossier Report Endpoint

The `/api/v1/dossier` endpoint generates a simple, static event dossier report based on provided input. This feature is a proof of concept and does not use AI or LLMs. The report is generated using a template and basic data aggregation.

**Example usage:**

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/event"}' \
  http://localhost:3000/api/v1/dossier
```

> 📝 The dossier report is static and for demonstration only. No AI or advanced analysis is performed.

---

## 📁 Project Structure

```
shofar/
├── api/v1/           # API endpoints (health, news, tweets, dossier)
├── assets/
│   ├── json/         # Disaster and emergency keywords
│   └── templates/    # EJS templates for reports
├── utils/v1/lib/     # Core logic, datasources, services, utils, config
│   ├── datasources/
│   ├── services/
│   ├── utils/
│   └── config/
└── ...
```

---

## ⚖️ Legal & Disclaimer

> **Proof of Concept Only!**
>
> This project is for educational and research purposes only. Web scraping may be subject to legal and ethical restrictions depending on your jurisdiction and the terms of service of the data sources. Use responsibly and at your own risk. 🚨

---

## 📄 License

MIT