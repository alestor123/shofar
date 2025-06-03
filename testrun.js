// Example usage
const { GNews } = require('gnews');
const moment = require('moment');

const gnews = new GNews({
  apiKey: process.env.GNEWS_API_KEY || 'your-api-key-here', // Replace this or set via env
  max: 50,
  lang: 'en',
  country: 'us'
});

async function getDisasterNews(limit = 50) {
  const keywords = [
    'disaster',
    'war', 
    'bombing',
    'armed conflict',
    'earthquake',
    'hurricane',
    'terror attack',
    'crisis'
  ];
  
  try {
    // Use individual searches or simpler query format
    const searchQuery = keywords.join(' OR ');
    const results = await gnews.search(searchQuery);
    
    // Check if results exist and have the expected structure
    if (!results || !Array.isArray(results)) {
      console.log('No results found or unexpected result format');
      return [];
    }
    
    const articles = results
      .slice(0, limit)
      .filter(article => {
        // Add safety checks for article properties
        if (!article || !article.publishedAt) {
          return false;
        }
        return moment(article.publishedAt).isAfter(moment().subtract(2, 'weeks'));
      })
      .map(article => ({
        title: article.title || 'No title',
        source: article.source?.name || 'Unknown source',
        url: article.url || '',
        published: article.publishedAt || '',
        description: article.description || '',
        content: article.content || ''
      }));
    
    return articles;
    
  } catch (error) {
    console.error('Error fetching disaster news:', error);
    return [];
  }
}



module.exports = { getDisasterNews };
async function main() {
  try {
    const news = await getDisasterNews(20);
    console.log(`Found ${news.length} disaster-related articles:`);
    news.forEach(article => {
      console.log(`\n${article.title}`);
      console.log(`Source: ${article.source}`);
      console.log(`Published: ${article.published}`);
      console.log(`URL: ${article.url}`);
    });
  } catch (error) {
    console.error('Error in main:', error);
  }
}

// Uncomment to run
main();
