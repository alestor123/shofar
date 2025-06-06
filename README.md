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
| `/api/v1/main`        | GET    | Aggregated event intelligence (NewsAPI, geocoding, etc.) |

---

## 📖 API Endpoint Details

### `/api/v1/health`  
**Method:** `GET`  
**Description:** Returns a simple health check response to verify the API is running.

**Example Request:**
```
curl http://localhost:3000/api/v1/health
```
**Example Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-06-06T12:00:00.000Z",
  "message": "API is healthy"
}
```

---

### `/api/v1/news`  
**Method:** `GET`  
**Description:** Fetches the latest disaster and crisis news articles from Google News, filtered by a curated list of keywords (see `assets/json/keywords.json`).

**How it works:**
- Scrapes Google News for articles matching disaster/emergency keywords.
- Returns a list of articles with title, source, URL, publish date, description, and thumbnail.

**Example Request:**
```
curl http://localhost:3000/api/v1/news
```
**Example Response:**
```json
[
  {
    "title": "Floods hit City Y",
    "source": "Google News",
    "url": "https://news.example.com/article",
    "published": "2025-06-04T12:00:00Z",
    "description": "Severe flooding...",
    "thumbnail": "https://.../image.jpg"
  }
]
```

---

### `/api/v1/tweets`  
**Method:** `GET`  
**Description:** Fetches the latest tweets related to disasters and emergencies using Nitter (an alternative Twitter frontend). Filters tweets by the same curated keywords.

**How it works:**
- Scrapes Nitter for tweets containing disaster/emergency keywords.
- Returns a list of tweets with content, username, display name, tweet URL, images, and hashtags.

**Example Request:**
```
curl http://localhost:3000/api/v1/tweets
```
**Example Response:**
```json
[
  {
    "content": "Major earthquake in City Z! #earthquake #disaster",
    "username": "@newsaccount",
    "displayName": "News Account",
    "tweetUrl": "https://nitter.net/newsaccount/status/1234567890",
    "images": ["https://nitter.net/pic/media/xyz.jpg"],
    "hashtags": ["earthquake", "disaster"]
  }
]
```

---

### `/api/v1/dossier`  
**Method:** `POST`  
**Description:** Generates a simple, static event dossier report based on provided input (such as a URL or event description). This is a proof-of-concept feature and does not use AI or LLMs.

**Request Body:**
```json
{
  "url": "https://example.com/event"
}
```

**How it works:**
- Accepts a JSON payload with event information (e.g., a URL).
- Generates a static report using a template and basic data aggregation.
- Returns the report in markdown or plain text.

**Example Request:**
```
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/event"}' \
  http://localhost:3000/api/v1/dossier
```
**Example Response:**
```
# Event Dossier

- **Source:** https://example.com/event
- **Date:** June 6, 2025
- **Summary:** [Static summary here]

*This is a proof-of-concept dossier report.*
```

> 📝 The dossier report is static and for demonstration only. No AI or advanced analysis is performed.

---

### `/api/v1/main`  
**Method:** `GET`  
**Description:** Aggregates and enriches global event intelligence from major news sources using NewsAPI, disaster/emergency keywords, and geocoding. Returns only events with both a detected type and geolocation.

**How it works:**
- Fetches news articles from major sources (e.g., BBC, CNN, Reuters, Al Jazeera, CNBC, Fox News, MSNBC, The New York Times, The Washington Post) using NewsAPI.
- Filters articles by disaster/emergency keywords (see `assets/json/keywords.json`).
- Uses basic text matching to determine event type.
- Attempts to extract geolocation (latitude/longitude) from article text using place names and geocoding.
- Only returns articles with both a detected type and geolocation.

**Example Request:**
```
curl http://localhost:3000/api/v1/main
```
**Example Response:**
```json
[
  {
    "source": { "id": "bbc-news", "name": "BBC News" },
    "author": "BBC Reporter",
    "title": "Earthquake strikes City Q",
    "description": "A major earthquake has hit...",
    "url": "https://bbc.com/news/earthquake-article",
    "urlToImage": "https://bbc.com/news/image.jpg",
    "publishedAt": "2025-06-05T10:00:00Z",
    "content": "...full article text...",
    "lat": 34.0522,
    "long": -118.2437,
    "gmapLink": "https://www.google.com/maps?q=34.0522,-118.2437",
    "type": "earthquake"
  }
]
```

**Notes:**
- News sources include: Al Jazeera, BBC News, CNBC, CNN, Fox News, MSNBC, Reuters, The New York Times, The Washington Post.
- Requires a valid NewsAPI key and OpenCage geocoding key in your `.env` file.
- Only articles with both a recognized event type and geolocation are returned.
- See `utils/v1/lib/services/eventService.js` for implementation details.

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

---

## 🙏 Credits & Acknowledgements

- [Google News](https://news.google.com/) — News data source
- [Nitter](https://nitter.net/) — Twitter alternative frontend for scraping tweets
- [NewsAPI](https://newsapi.org/) — News aggregation API (for `/api/v1/main`)
- [OpenCage Geocoding API](https://opencagedata.com/) — Geocoding service
- [Al Jazeera](https://aljazeera.com/)
- [BBC News](https://bbc.com/news)
- [CNBC](https://cnbc.com/)
- [CNN](https://cnn.com/)
- [Fox News](https://foxnews.com/)
- [MSNBC](https://msnbc.com/)
- [Reuters](https://reuters.com/)
- [The New York Times](https://nytimes.com/)
- [The Washington Post](https://washingtonpost.com/)
- All open-source contributors and the OSINT community 🌐