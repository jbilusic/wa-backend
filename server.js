const express = require("express");
const app = express();
require('dotenv').config()
const PORT = 3000;
app.use(express.json());
app.use(express.urlencoded({extended: false}))

const jwt = require('jsonwebtoken');

const authMiddleware = require('./authMiddleware.js');

//cors
const cors = require('cors');
var corsOptions = {
    origin: 'http://127.0.0.1:5173',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    credentials:true
  }
app.use(cors(corsOptions))

//img
const fs = require('fs');
const uploadDir = './images';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
app.use("/images",express.static('images'));

//routes
const usersRoute= require('./routes/users')
const articleRoute= require('./routes/articles')
const protectedArticle= require('./routes/articlesProtected')
const commentsRoute= require('./routes/comments')
const db = require('./database/database');
const loginRoute =  require('./routes/login')
db.connectToServer();
const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use((req,res,next)=>{
  console.log("Type: "+ req.method + ",  Route: " + req.url);
  next();
})

app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server na portu: "+ PORT);
    else 
        console.log("error ne moze se spojit na port i error je", error);
})

app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Protected endpoint reached!' });
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7); // Extract the token from the Authorization header
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
    res.status(401).json({ error: 'Token not provided or malformed' });
  }
}

app.use('/users',usersRoute);
app.use('/login',loginRoute);
app.use('/article',articleRoute);
app.use('/protectedArticle',authenticateToken,protectedArticle);
app.use('/comments',authenticateToken,commentsRoute);
