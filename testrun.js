const ALL_KEYWORDS = ['keralaflood', 'heavyrain', 'flood', 'rainupdate', 'weather'];

function extractTweetsFromHtml(html) {
    const $ = cheerio.load(html);
    const tweets = [];

    $('.timeline-item').each((_, element) => {
        const tweet = $(element);
        
        // Extract basic tweet information
        const content = tweet.find('.tweet-content').text().trim();
        const published = tweet.find('.tweet-date a').attr('title') || '';
        const username = tweet.find('.username').text().trim();
        const displayName = tweet.find('.fullname').text().trim().replace(/Verified.*/, '').trim();
        const tweetUrl = tweet.find('.tweet-link').attr('href') ? `https://nitter.net${tweet.find('.tweet-link').attr('href')}` : null;
        
        // Extract images
        const images = [];
        tweet.find('.attachment img').each((_, img) => {
            const src = $(img).attr('src');
            if (src) {
                images.push(src.startsWith('http') ? src : `https://nitter.net${src}`);
            }
        });
        
        // Extract hashtags
        const hashtags = [];
        const hashtagRegex = /#(\w+)/g;
        let match;
        while ((match = hashtagRegex.exec(content)) !== null) {
            hashtags.push(match[1].toLowerCase());
        }
        
        // Extract geo coordinates (if any)
        const geoRegex = /(-?\d{1,2}\.\d+)[,\s]+(-?\d{1,3}\.\d+)/;
        const geoMatch = content.match(geoRegex);
        const geo = geoMatch ? {
            latitude: parseFloat(geoMatch[1]),
            longitude: parseFloat(geoMatch[2])
        } : null;
        
        // Create gmaps link if coordinates exist
        const gmapsLink = geo ? `https://maps.google.com/?q=${geo.latitude},${geo.longitude}` : null;
        
        // Push formatted tweet data
        tweets.push({
            keywords: ALL_KEYWORDS.join(', '),
            content,
            published,
            username,
            displayName,
            tweetUrl,
            images,
            latitude: geo?.latitude ?? null,
            longitude: geo?.longitude ?? null,
            gmapsLink,
            hashtags
        });
    });

    return tweets;
}