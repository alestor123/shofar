const scrapeGoogleNews = require('google-news-scraper');
const axios = require('axios');
const cheerio = require('cheerio');
const NodeGeocoder = require('node-geocoder');
const compromise = require('compromise');

const DISASTER_KEYWORDS = [
  'disaster', 'war', 'conflict', 'airstrike', 'explosion', 'missile',
  'earthquake', 'flood', 'cyclone', 'hurricane', 'volcano',
  'terror attack', 'civil unrest', 'genocide', 'refugee crisis'
];

// Geocoder setup (You can switch to OpenCage or Nominatim if needed)
const geocoder = NodeGeocoder({
  provider: 'openstreetmap' // or 'google' if you have an API key
});

async function extractThumbnail(articleUrl) {
  try {
    const res = await axios.get(articleUrl, { timeout: 5000 });
    const $ = cheerio.load(res.data);
    const image =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content');
    return image || null;
  } catch {
    return null;
  }
}

async function extractLatLongFromText(text) {
  const doc = compromise(text);
  const places = doc.places().out('array');
  if (places.length > 0) {
    try {
      const result = await geocoder.geocode(places[0]);
      if (result.length > 0) {
        return {
          latitude: result[0].latitude,
          longitude: result[0].longitude
        };
      }
    } catch {}
  }
  return { latitude: null, longitude: null };
}

async function getDisasterNews(limit = 10) {
  try {
    const articles = await scrapeGoogleNews({
      searchTerm: DISASTER_KEYWORDS.join(' OR '),
      prettyUrls: true,
      timeframe: '24h',
      queryVars: {
        hl: 'en',
        gl: 'US',
        ceid: 'US:en'
      }
    });

    const seenUrls = new Set();

    const processed = [];

    for (const article of articles) {
      if (processed.length >= limit) break;
      if (seenUrls.has(article.link)) continue;
      seenUrls.add(article.link);

      const [thumbnail, geo] = await Promise.all([
        extractThumbnail(article.link),
        extractLatLongFromText(article.title + ' ' + article.snippet)
      ]);

      processed.push({
        title: article.title,
        source: article.source,
        url: article.link,
        published: article.date,
        description: article.snippet,
        thumbnail,
        latitude: geo.latitude,
        longitude: geo.longitude
      });
    }

    return processed;

  } catch (error) {
    console.error('News scraping failed:', error);
    return [];
  }
}

module.exports = { getDisasterNews };
