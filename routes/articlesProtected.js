const express = require('express');
const router = express.Router();
const database = require('../database/database');
const articleSchema = require('../schemas/ArticleSchema');
const multer = require("multer");
const jwt = require('jsonwebtoken');
require('dotenv').config()

const path = require('path')
var ObjectId = require('mongodb').ObjectId;
const authMiddleware = require('../authMiddleware.js.js');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './images') // The path should be relative to the root directory of your project
  },
  filename: (req, file, cb) => {
    //console.log(file);
    cb(null, Date.now() + path.extname(file.originalname))
  }
})
const upload = multer({ storage: storage });
let users;
router.use((req,res,next)=>{
    console.log("Logging Protected Article route");
    next();
})

router.get('/', async(req,res)=>{
    try {
        const articles = await database.getDb().collection("articles").find();
        articles = await articles.toArray();
        res.status(200).json(articles); 
    }
    catch (error) {
        console.log(error);
    }
})



  
  
router.post('/add', upload.single('img'), async (req, res) => {
  try {
    
    const TokenUsername = req.user.username;
    let username = await database.getDb().collection('admins').findOne({ username: TokenUsername.toLowerCase() })
    console.log(TokenUsername)
    let img;
    if (!req.file) {
      return res.status(400).send('No file was uploaded.');
    }
    img = req.file.filename;
    if (username == null) {
      console.log("Admin ne postoji u bazi");
      res.status(403).json({ message: " admin ne postoji!" });
      return;
    }
    let article = new articleSchema();
    article.author = TokenUsername;
    article.title = req.body.title;
    article.content = req.body.content;
    article.img = img;
    article.views =0;
    article.postDate = Date.now;

    let result = await database.getDb().collection('articles').insertOne(article)

    console.log(result.insertedId);
    if (result.insertedId) {
      return res.status(201).json({ "id": result.insertedId});
    }
    else {
      res.status(500).json({ message: "Greska kod dodavanja artikla!" });
      return;
    }

  } catch (error) {
    res.status(500).send("error:" + error);
  }
});

router.patch('/modify/:id', upload.single('img'), async (req, res) => {
  try {
    const TokenUsername = req.user.username;
    let username = await database.getDb().collection('admins').findOne({ username: TokenUsername.toLowerCase() })
    console.log(username);
    if (username == null) {
      console.log("Admin ne postoji u bazi");
      res.status(403).json({ message: " admin ne postoji!" });
      return;
    }
    const articleId = req.params.id;
    let updateFields = {};
    if (req.body.title) {
      updateFields.title = req.body.title;
    }
    if (req.body.content) {
      updateFields.content = req.body.content;
    }
    if (req.file) {
      updateFields.img = req.file.filename;
    }
      
    let result = await database.getDb().collection('articles').updateOne({ _id: new ObjectId(articleId) }, { $set: updateFields });
    if (result.modifiedCount === 0) {
      console.log(`Article with ID ${articleId} not found`);
      return res.status(404).json({ message: `Article with ID ${articleId} not found` });
    }
    else {
      console.log(`Article with ID ${articleId} has been updated`);
      return res.status(200).json({ message: `Article with ID ${articleId} has been updated` });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error!" });
  }
});

router.delete('/delete/:id', async (req, res) => {
  try {
    const TokenUsername = req.user.username;
    let username = await database.getDb().collection('admins').findOne({ username: TokenUsername.toLowerCase() })
    console.log(username);
    if (username == null) {
      console.log("Admin ne postoji u bazi");
      res.status(403).json({ message: " admin ne postoji!" });
      return;
    }
    const articleId = req.params.id;
    
    const result = await database.getDb().collection('articles').deleteOne({ _id: new ObjectId(articleId) });
    
    if (result.deletedCount === 1) {
      // Article deleted successfully
      res.status(200).json({ message: 'Article deleted successfully' });
    } else {
      // Article not found or failed to delete
      res.status(404).json({ message: 'Article not found or failed to delete' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error!' });
  }
});




module.exports = router;