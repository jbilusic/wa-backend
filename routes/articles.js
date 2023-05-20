const express = require('express');
const router = express.Router();
const database = require('../database/database');
const articleSchema = require('../schemas/ArticleSchema');

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

router.post('/search', async(req,res)=>{
    let article = await database.getDb().collection('articles').find({ title: req.body.title})
    article = await article.toArray()
    if(article==""){
        console.log("taj artikl ne postoji u bazi");
        res.status(404).send("Ne postoji");
        return;
    }
    res.status(200).send(article);
})

router.post('/add', async(req,res)=>{
    try {
        let username = await database.getDb().collection('admins').find({ username: req.body.username.toLowerCase()})
        username = await username.toArray()
        if(username=="" ){
            console.log("Admin ne postoji u bazi");
            res.status(403).json({ message: " admin ne postoji!"});
            return;
        }

        let article = new articleSchema();
        article.author = username.name;
        article.title = req.body.title;
        article.content = req.body.content;
        let result = await database.getDb().collection('articles').insertOne(article)
        if (result.insertedId){
            return res.status(201).json({ "article": article.title});
        }
        else{
            res.status(500).json({message: "Greska kod dodavanja artikla!"});  
            return;
        } 
       
    } catch (error) {
        res.status(500).send("error:" + error);  
    }
})



module.exports = router;