const express = require("express");
const app = express();
const PORT = 3000;
app.use(express.json());
app.use(express.urlencoded({extended: false}))

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
const commentsRoute= require('./routes/comments')
const db = require('./database/database');

db.connectToServer();
const cookieParser = require('cookie-parser');
//app.use(cookieParser());

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



app.use('/users',usersRoute);
app.use('/article',articleRoute);
app.use('/comments',commentsRoute);


  