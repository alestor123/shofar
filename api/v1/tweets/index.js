const { scrapeNitterTweets } = require('../../../utils/v1/lib/services/tweetService');

module.exports = async (req, res) => {
  try {
    // Optional: parse query param to limit number of tweets, default 20
    const limit = parseInt(req.query.limit) || 20;

    // Fetch tweets using your scraper
    const tweets = await scrapeNitterTweets(limit);

    // Return JSON response
    res.status(200).json({
      success: true,
      count: tweets.length,
      results: tweets
    });
  } catch (error) {
    console.error('Tweets API error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tweets',
      error: error.message
    });
  }
};
