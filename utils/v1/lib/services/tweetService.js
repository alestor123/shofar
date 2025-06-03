const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://nitter.net';

// Load keywords from JSON
const keywordsFile = path.resolve(process.cwd(), 'assets/json/keywords.json');
const { disasterKeywords, emergencyKeywords } = JSON.parse(fs.readFileSync(keywordsFile, 'utf-8'));

const ALL_KEYWORDS = [...disasterKeywords, ...emergencyKeywords];

// Build a single search URL (first page only)
function buildSearchUrl(keywords) {
    const query = keywords
        .map(k => '#' + k.replace(/\s+/g, ''))
        .join(' OR ');
    const encodedQuery = encodeURIComponent(query + ' lang:en');
    return `${BASE_URL}/search?q=${encodedQuery}&f=tweets`;
}

// Extract lat/lon from tweet text
function extractLatLong(text) {
    const regex = /(-?\d{1,2}\.\d+)[,\s]+(-?\d{1,3}\.\d+)/;
    const match = text.match(regex);
    if (match) {
        return {
            latitude: parseFloat(match[1]),
            longitude: parseFloat(match[2]),
        };
    }
    return null;
}

// Extract hashtags
function extractHashtags(text) {
    const regex = /#(\w+)/g;
    const tags = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
        tags.push(match[1].toLowerCase());
    }
    return tags;
}

// Fetch only the first page of tweets
async function scrapeNitterTweets(keywords = ALL_KEYWORDS) {
    const url = buildSearchUrl(keywords);
    console.log(`Fetching first page: ${url}`);

    try {
        const res = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NitterScraper/1.0)' }
        });

        const $ = cheerio.load(res.data);
        const tweets = [];

        $('.timeline-item').each((_, el) => {
            const tweetEl = $(el);
            const content = tweetEl.find('.tweet-content').text().trim();

            const timeAttr = tweetEl.find('a.tweet-date > time').attr('datetime');
            const published = timeAttr ? new Date(timeAttr).toISOString() : null;

            const username = tweetEl.find('.username').text().trim();
            const displayName = tweetEl.find('.fullname').text().trim();
            const tweetUrlSuffix = tweetEl.find('a.tweet-date').attr('href');
            const tweetUrl = tweetUrlSuffix ? BASE_URL + tweetUrlSuffix : null;

            const images = [];
            tweetEl.find('.attachments img').each((_, imgEl) => {
                const src = $(imgEl).attr('src');
                if (src) images.push(src.startsWith('http') ? src : BASE_URL + src);
            });

            const geo = extractLatLong(content);
            const hashtags = extractHashtags(content);
            const gmapsLink = geo ? `https://maps.google.com/?q=${geo.latitude},${geo.longitude}` : null;

            tweets.push({
                keywords: keywords.join(', '),
                content,
                published,
                username,
                displayName,
                tweetUrl,
                images,
                latitude: geo?.latitude ?? null,
                longitude: geo?.longitude ?? null,
                gmapsLink,
                hashtags,
            });
        });

        return tweets;
    } catch (error) {
        console.error('Error fetching from Nitter:', error.message);
        return [];
    }
}

// Export the simplified function
module.exports = { scrapeNitterTweets };
