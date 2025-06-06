const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { execSync } = require('child_process');

const BASE_URL = 'https://nitter.net';
const TWITTER_BASE_URL = 'https://twitter.com';

const keywordsFile = path.resolve(process.cwd(), 'assets/json/keywords.json');
const { disasterKeywords, emergencyKeywords } = JSON.parse(fs.readFileSync(keywordsFile, 'utf-8'));
const ALL_KEYWORDS = [...disasterKeywords, ...emergencyKeywords];

function buildSearchUrl(cursor = null) {
  const query = ALL_KEYWORDS.map(k => '#' + k.replace(/\s+/g, '')).join(' OR ');
  const encoded = encodeURIComponent(query + ' lang:en');
  return `${BASE_URL}/search?f=tweets&q=${encoded}&f-news=on&f-verified=on` + (cursor ? `&cursor=${cursor}` : '');
}

function runCurl(url) {
  try {
  const cmd = `curl -L --compressed -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)" \
-H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8" \
-H "Accept-Encoding: gzip, deflate, br" \
-H "Accept-Language: en-US,en;q=0.9" \
-H "Cache-Control: no-cache" \
-H "Pragma: no-cache" \
"${url}" 2> /dev/null`;
    return execSync(cmd, { encoding: 'utf-8' });
  } catch (err) {
    console.error('Curl failed:', err.message);
    return '';
  }
}

function extractLatLong(text) {
  const regex = /(-?\d{1,2}\.\d+)[,\s]+(-?\d{1,3}\.\d+)/;
  const match = text.match(regex);
  return match ? { latitude: parseFloat(match[1]), longitude: parseFloat(match[2]) } : null;
}

function extractHashtags(text) {
  const regex = /#(\w+)/g;
  const tags = [];
  let match;
  while ((match = regex.exec(text)) !== null) tags.push(match[1].toLowerCase());
  return tags;
}
async function scrapeNitterTweets(limit = 20 ,MAX_PAGES = 20) {
  let allTweets = [];
  let cursor = null;

  for (let page = 0; page < MAX_PAGES; page++) {
    const url = buildSearchUrl(cursor);
    const html = runCurl(url);
    const $ = cheerio.load(html);
    var count = 0;
    $('.timeline-item').each((_, el) => {
      if(count > limit) return false; // Stop if we reach the limit
      count++;
      // Skip retweets
      const tweetEl = $(el);
      const content = tweetEl.find('.tweet-content').text().trim();

      const tweetLinkEl = tweetEl.find('.tweet-date a');
      const nitterHref = tweetLinkEl.attr('href') || '';
      const tweetUrl = nitterHref ? `${TWITTER_BASE_URL}${nitterHref.replace(/#m$/, '')}` : null;
      const twitterId = nitterHref.split('/').pop()?.replace('#m', '') || null;

      const relativeTime = tweetLinkEl.text().trim() || null; // "11 Dec 2024"
      const exactTime = tweetLinkEl.attr('title') || null;     // "Dec 11, 2024 · 7:30 AM UTC"

      const username = tweetEl.find('.username').text().replace('@', '').trim();
      const displayName = tweetEl.find('.fullname').text().trim();

      const avatarPath = tweetEl.find('.tweet-avatar img').attr('src') || '';
      const avatar = avatarPath.startsWith('http') ? avatarPath : `${BASE_URL}${avatarPath}`;

      const locationEl = tweetEl.find('.tweet-header .location, .location');
      const location = locationEl.length ? locationEl.first().text().trim() : null;

      const images = [];
      tweetEl.find('.attachments img').each((_, imgEl) => {
        const src = $(imgEl).attr('src');
        if (src) images.push(src.startsWith('http') ? src : BASE_URL + src);
      });

      const geo = extractLatLong(content);
      const gmapsLink = geo ? `https://maps.google.com/?q=${geo.latitude},${geo.longitude}` : null;
      const hashtags = extractHashtags(content);

      allTweets.push({
        content,
        username,
        displayName,
        tweetUrl,
        twitterId,
        avatar,
        published: exactTime,     // e.g. "Dec 11, 2024 · 7:30 AM UTC"
        relativeTime,             // e.g. "11 Dec 2024"
        location,
        images,
        latitude: geo?.latitude ?? null,
        longitude: geo?.longitude ?? null,
        gmapsLink,
        hashtags,
      });
    });

const nextLink = $('div.show-more a').attr('href');
    if (!nextLink) break;
    const nextCursor = new URLSearchParams(nextLink.split('?')[1]).get('cursor');
    if (!nextCursor) break;
    cursor = nextCursor;
  }

  return allTweets;
}


module.exports = { scrapeNitterTweets };
