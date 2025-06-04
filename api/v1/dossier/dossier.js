const generateDossier = require('../../../utils/v1/lib/services/dossierReport');
module.exports = async (req, res) => {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).send('Only GET requests allowed');
  }

  // Get URL from query parameter
  const url = req.query.url;
  
  // Check if URL exists
  if (!url) {
    return res.status(400).send('URL parameter is required (?url=...)');
  }

  try {
    // Generate markdown report
    const markdownReport = await generateDossier(url);
    
    // Set appropriate headers and send
    res.setHeader('Content-Type', 'text/markdown');
    return res.send(markdownReport);
    
  } catch (error) {
    // Return error as plain text
    res.setHeader('Content-Type', 'text/plain');
    return res.status(500).send(`Error generating report: ${error.message}`);
  }
};