const { scrapeNitterTweets } = require('../../../utils/v1/lib/services/tweetService');

module.exports = async (req, res) => {
  try {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Content-Type, Authorization"
  );

    // Optional: parse query param to limit number of tweets, default 20
    const articlelimit = parseInt(req.query.alimit) || 20;
    const pagelimit = parseInt(req.query.plimit) || 20;
    // Fetch tweets using your scraper
    const tweets = await scrapeNitterTweets(articlelimit, pagelimit);

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
