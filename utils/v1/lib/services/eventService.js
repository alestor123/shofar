const axios = require('axios');
const NodeGeocoder = require('node-geocoder');
const compromise = require('compromise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const apiKey = process.env.NEWS_API_KEY; // Your NewsAPI key

const geocoder = NodeGeocoder({
  provider: 'opencage',
  apiKey: process.env.OPENCAGE_API_KEY,  // Add this to your .env
});

const keywordsFile = path.resolve(process.cwd(), 'assets/json/keywords.json');
const { disasterKeywords } = JSON.parse(fs.readFileSync(keywordsFile, 'utf-8'));

const allKeywords = [...disasterKeywords];
const query = allKeywords.map(k => `"${k}"`).join(" OR ");

// Calculate date 14 days ago
const fromDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

async function extractLatLongFromText(text) {
  const doc = compromise(text);
  const places = doc.places().out('array');
  if (places.length > 0) {
    try {
      const result = await geocoder.geocode(places[0]);
      if (result.length > 0) {
        return {
          lat: result[0].latitude,
          long: result[0].longitude,
          gmapLink: `https://www.google.com/maps?q=${result[0].latitude},${result[0].longitude}`
        };
      }
    } catch (err) {
      console.error(`Geocoding error for '${places[0]}':`, err.message);
    }
  }
  return { lat: null, long: null, gmapLink: null };
}
function determineType(text) {
  const lowerText = text.toLowerCase();
  for (const keyword of allKeywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      return keyword;
    }
  }
  return null;
}

async function fetchNewsWithKeywords() {
  try {
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: query,
        sources: 'aljazeera,bbc-news,cnbc,cnn,fox-news,msnbc,reuters,the-new-york-times,the-washington-post',
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 100,
        from: fromDate,
        apiKey: apiKey
      }
    });

    const articles = response.data.articles;

    const results = await Promise.all(articles.map(async (article) => {
      const fullText = `${article.title} ${article.description || ''} ${article.content || ''}`;
      const geoData = await extractLatLongFromText(fullText);
        const matchedType = determineType(fullText);
        if(!geoData.gmapLink || !matchedType) return null; // Skip if no geolocation data
      return {
        source: article.source,
        author: article.author,
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
        content: article.content,
        lat: geoData.lat,
        long: geoData.long,
        gmapLink: geoData.gmapLink,
        type: matchedType
      };
    }));

    return (results.filter(r => r !== null)); // Filter out null results
     
  } catch (error) {
    console.error("Error fetching news articles:", error.message);
    return [];
  }
}
module.exports = fetchNewsWithKeywords;