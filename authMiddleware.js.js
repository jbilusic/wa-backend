const jwt = require('jsonwebtoken');
//const secretKey = 'your-secret-key'; // Replace with your own secret key

// Middleware function to authenticate the JWT token
function authenticateToken(req, res, next) {
  try {
    if (token) {
      // Verify the token
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          res.status(403).json({ error: 'Invalid token' });
        } else {
          // Token is valid, store the decoded information in the request object
          req.user = decoded;
          next();
        }
      });
    } else {
      res.status(401).json({ error: 'Token not provided' });
    }
  } catch (error) {
    res.status(401).json({ error: 'Token not provided' });
  }
  const token = req.headers.authorization;

 
}

module.exports = {
  authenticateToken,
};
