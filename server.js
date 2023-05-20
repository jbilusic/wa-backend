const express = require("express");
const app = express();
const PORT = 3000;
app.use(express.json());
app.use(express.urlencoded({extended: false}))

//routes
const usersRoute= require('./routes/users')
const articleRoute= require('./routes/articles')
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


  