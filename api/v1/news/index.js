const { getDisasterNews } = require('../../../utils/v1/lib/services/newsService');

module.exports = async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only GET requests are supported'
    });
  }

  const { limit = 50, fulltext = 'false' } = req.query;
  
  // Validate limit parameter
  const parsedLimit = Number(limit);
  if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
    return res.status(400).json({
      error: 'Invalid limit parameter',
      message: 'Limit must be a number between 1 and 100'
    });
  }
  
  try {
    let news = await getDisasterNews(parsedLimit);
    
    // Ensure news is an array
    if (!Array.isArray(news)) {
      news = [];
    }
    
    // Remove fullText if not requested (assuming your service returns this field)
    if (fulltext.toLowerCase() !== 'true') {
      news = news.map(({ fullText, content, ...rest }) => rest);
    }

    // Set appropriate cache headers
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=300');
    res.setHeader('Content-Type', 'application/json');
    
    // Add CORS headers if needed
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    return res.status(200).json({ 
      success: true,
      count: news.length,
      limit: parsedLimit,
      timestamp: new Date().toISOString(),
      results: news 
    });
    
  } catch (error) {
    console.error('Error in disaster news handler:', error);
    
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch news',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
};