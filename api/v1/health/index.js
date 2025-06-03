module.exports = (req, res) => {
  res.status(200).json({ message: 'Health OK' }); 
  // Log the health check request
};