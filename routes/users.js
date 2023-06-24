const express = require('express');
const router = express.Router();
const database = require('../database/database');
const userSchema = require('../schemas/UsersSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

let users;
router.use((req,res,next)=>{
    console.log("Logging user route");
    next();
})

router.get('/', async(req,res)=>{
    try {
        const usersTemp = await database.getDb().collection("users").find();
        users = await usersTemp.toArray();
        res.status(200).json(users); 
    }
    catch (error) {
        console.log(error);
    }
})

router.post('/search', async(req,res)=>{
    let user = await database.getDb().collection('users').find({ username: req.body.username})
    user = await user.toArray()
    if(user == ""){
        console.log("taj username ne postoji u bazi");
        res.status(404).send("Ne postoji");
        return;
    }
    res.status(200).send(user);
})

/*
router.post('/add', async(req,res)=>{
    try {
        let email = await database.getDb().collection('users').find({ email: req.body.email.toLowerCase()})
        let username = await database.getDb().collection('users').find({ username: req.body.username.toLowerCase()})
        email = await email.toArray()
        username = await username.toArray()
        if(username!="" ){
            console.log("Username postoji u bazi");
            res.status(403).json({ message: "Username vec postoji!"});
            return;
        }
        if(email != ""){
            console.log("Email je vec registriran");
            res.status(403).json({ message: "Email vec postoji!"});
            return;
        }
        let temp = Date.now();
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        let user = new userSchema();
        user.email = req.body.email;
        user.password = hashedPassword;
        user.timestamp = temp;
        user.numOfComments = 0;
        user.numOfReactions = 0;
        user.bookmarks = [];

        let result = await database.getDb().collection('users').insertOne(user)
        if (result.insertedId){
            res.status(201).json({message: "Uspjesno registriran "+ req.body.username});  
            return;
        }
        else{
            res.status(500).json({message: "Greska kod registriracije!"});  
            return;
        }
    } catch (error) {
        res.status(500).send("error:" + error);  
    }
})
*/

router.get('/profile', async (req, res) =>{
    try {
      const TokenUsername = req.user.username;
      console.log(TokenUsername);
      let username = await database.getDb().collection('users').findOne({ username: TokenUsername.toLowerCase() })
      if (username != null) {
        let response={
            username: username.username,
            comments: username.numOfComments,
            reactions: username.numOfReactions,
            created: username.timestamp,
            bookmarks: username.bookmarks
        }
        console.log(response);
        return res.status(200).json({response});
      }else{
        let admin = await database.getDb().collection('admins').findOne({ username: TokenUsername.toLowerCase() })
        if (username != null) {
            let response={
                username: username.username,
                comments: username.numOfComments,
                reactions: username.numOfReactions,
                created: username.timestamp,
                bookmarks: username.bookmarks
            }
        return res.status(200).json({response});
      }
      else{
        return res.status(404).json({msg:"not found"});
      }
      
    }
    }
     catch (error) {
      console.log(error);
      return res.status(500).json({msg:"not found2"});
    }
  })
    

  router.get('/bookmark/:id', async (req, res) => {
    const TokenUsername = req.user.username;
    const articleId = req.params.id;
    console.log(articleId);
    try {
      const user = await database.getDb().collection('users').findOne({ username: TokenUsername.toLowerCase() });
      if (user != null) {
        const bookmarkIndex = user.bookmarks.indexOf(articleId);
        if (bookmarkIndex !== -1) {
            console.log("removed");
          user.bookmarks.splice(bookmarkIndex, 1);
          await database.getDb().collection('users').updateOne(
            { username: TokenUsername.toLowerCase() },
            { $pull: { bookmarks: articleId } }
           
          );
          return res.status(200).json({ response: "Bookmark removed" });
        } else {
            console.log("added");

          user.bookmarks.push(articleId);
          await database.getDb().collection('users').updateOne(
            { username: TokenUsername.toLowerCase() },
            { $push: { bookmarks: articleId } }
          );
          return res.status(200).json({ response: "Bookmark added" });
        }
      } else {
        return res.status(404).json("User not found");
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ msg: "Internal Server Error" });
    }
  });


module.exports = router;