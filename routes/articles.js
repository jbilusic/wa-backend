const express = require('express');
const router = express.Router();
const database = require('../database/database');
const articleSchema = require('../schemas/ArticleSchema');
const multer = require("multer");
const path = require('path')
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './images') // The path should be relative to the root directory of your project
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, Date.now() + path.extname(file.originalname))
  }
})
const upload = multer({ storage: storage });
let users;
router.use((req,res,next)=>{
    console.log("Logging user route");
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

router.post('/search', async (req, res) => {
    console.log(req.body);
    let search = req.body.search;
    let regex = new RegExp(search, 'i'); // create a regular expression to match the search term (case-insensitive)
    let articles = await database.getDb().collection('articles').find({ title: { $regex: regex } }).toArray(); // use the $regex operator to match the title field with the regular expression
    if (articles.length === 0) {
      console.log(`No articles found matching ${search}`);
      res.status(404).send(`No articles found matching ${search}`);
    } else {
      console.log(`Found ${articles.length} articles matching ${search}`);
      res.status(200).send(articles);
    }
  });
  

router.post('/add', upload.single('img'), async (req, res) => {
  try {
    let img;
    if (!req.file) {
      return res.status(400).send('No file was uploaded.');
    }
    img = req.file.filename;
    let username = await database.getDb().collection('admins').find({ username: req.body.username.toLowerCase() })
    username = await username.toArray()
    if (username == "") {
      console.log("Admin ne postoji u bazi");
      res.status(403).json({ message: " admin ne postoji!" });
      return;
    }

    let article = new articleSchema();
    article.author = "petra99";
    article.title = req.body.title;
    article.content = req.body.content;
    article.img = img;

    let result = await database.getDb().collection('articles').insertOne(article)

    if (result.insertedId) {
      return res.status(201).json({ "article": article.title });
    }
    else {
      res.status(500).json({ message: "Greska kod dodavanja artikla!" });
      return;
    }

  } catch (error) {
    res.status(500).send("error:" + error);
  }
});

module.exports = router;
