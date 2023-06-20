const express = require('express');
const router = express.Router();
const database = require('../database/database');
const bcrypt = require('bcrypt');
const session = require('express-session');

const MongoDBSession = require('connect-mongodb-session')(session);
const store = new MongoDBSession({
    uri:db.getUri(),
    collection: db.getCollectionSession(),
})

router.use(session({
    secret: 'mysecret', // use a secret string to encrypt the session data
    resave:false,
    saveUninitialized: false,//login inace ce novi session id za svaki req do servera stavi na false
    store
  }));

const isAuth = (req,res,next)=>{    
if(req.session.authenticated)
    next();
else
    res.status(200).send(); //res.redirect('http://localhost:5500/login.html');  
}

router.use('/check',isAuth, async(req,res)=>{
    res.redirect('http://localhost:5500/home.html');
})



module.exports = router;