const express = require('express');
const router = express.Router();
const database = require('../database/database');
const articleSchema = require('../schemas/ArticleSchema');
const path = require('path')
var ObjectId = require('mongodb').ObjectId;




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
    console.log(regex);
    let articles = await database.getDb().collection('articles').find({ title: { $regex: regex } }).toArray(); // use the $regex operator to match the title field with the regular expression
    if (articles.length === 0) {
      console.log(`No articles found matching ${search}`);
      res.status(404).send(`No articles found matching ${search}`);
    } else {
      console.log(`Found ${articles.length} articles matching ${search}`);
      res.status(200).send(articles);
    }
  });

  router.get('/getById/:id', async (req, res) => {
 
    const articleId = req.params.id;
    console.log(articleId);
    try {
      let article = await database.getDb().collection('articles').findOne({ _id: new ObjectId(articleId) });
      if (!article) {
        console.log(`Article with ID ${articleId} not found`);
        res.status(404).json({ message: `Article with ID ${articleId} not found` });
      } else {
        console.log(`Found article with ID ${articleId}`);
        res.status(200).json({ article: article });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error!" });
    }
  });

router.get('/latest', async (req, res) => {
  try {

    console.log(req.session);
    let article = await database.getDb().collection('articles')
      .find()
      .sort({ postDate: -1 })
      .limit(1)
      .toArray();

    if (article.length === 0) {
      console.log('No articles found');
      res.status(404).send('No articles found');
    } else {
      console.log('Latest article found');
      res.status(200).send(article);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});
let i = 4;
router.get('/latestArticles', async (req, res) => {
  try {
    const start = parseInt(req.query.start) || 1; 
    let articles = await database.getDb().collection('articles')
      .find()
      .sort({ postDate: -1 })
      .skip(start) // Skip the first article
      .limit(4) // Retrieve the next four articles
      .toArray();

    if (articles.length === 0) {
      console.log('No articles found');
      res.status(404).send('No articles found');
    } else {
      console.log(`${articles.length} latest articles found`);
      res.status(200).send(articles);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

router.get('/searchByQuery', async (req, res) => {
  let regex = new RegExp(req.query.q, 'i'); 
  console.log(regex);
  let articles = await database.getDb().collection('articles').find({ title: { $regex: regex } }).toArray();
  if (articles.length === 0) {
    console.log(`No articles found matching ${req.query.q}`);
    res.status(200).send([]);
  } else {
    console.log(`Found ${articles.length} articles matching ${req.query.q}`);
    res.status(200).send(articles);
  }
});




module.exports = router;
