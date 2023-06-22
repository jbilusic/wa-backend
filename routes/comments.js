const express = require('express');
const router = express.Router();
const database = require('../database/database');
const commentsSchema = require('../schemas/CommentsSchema');
var ObjectId = require('mongodb').ObjectId;
const session = require('express-session');
const jwt = require('jsonwebtoken');
require('dotenv').config()

router.use((req,res,next)=>{
    console.log("Logging comments route");
    next();
})

router.get('/', async(req,res)=>{
    try {
        let comments = await database.getDb().collection("comments").find();
        comments = await comments.toArray();
        res.status(200).json(comments); 
    }
    catch (error) {
        console.log(error);
    }
})


router.post('/add', async (req, res) => {
  try {
    const TokenUsername = req.user.username;
    let username = await database.getDb().collection('users').findOne({ username: TokenUsername.toLowerCase() });
    
    if (!username) {
      console.log("User does not exist in the database");
      res.status(403).json({ message: "User does not exist!" });
      return;
    }
    console.log(Date.now());
    let temp = Date.now();
    let comment = {
      id: new ObjectId(),
      username: TokenUsername,
      content: req.body.comments.content,
      timestamp: temp,
      likes: {
        count: req.body.comments.likes.count,
        users: req.body.comments.likes.users
      },
      dislikes: {
        count: req.body.comments.dislikes.count,
        users: req.body.comments.dislikes.users
      }
    };
    
    let articleId = req.body.articleId;
    console.log(comment);
    let result = await database.getDb().collection('articles').updateOne(
      { _id: new ObjectId(articleId) },
      { $push: { comments: comment } }
    );

    let userResult = await database.getDb().collection('users').updateOne(
      { username: TokenUsername.toLowerCase() },
      { $inc: { numOfComments: 1 } }
    );

    if (result && userResult) {
      return res.status(201).json({ comment });
    } else {
      res.status(500).json({ message: "Error updating the article!" });
      return;
    }

  } catch (error) {
    res.status(500).send("Error: " + error);
  }
});


router.delete('/:articleId/:commentId', async (req, res) => {
  try {
    const TokenUsername = req.user.username;
    const articleId = req.params.articleId;
    const commentId = req.params.commentId;
    let username = await database.getDb().collection('admins').findOne({ username: TokenUsername.toLowerCase() });
    if (!username) {
      console.log("Admin does not exist in the database");
      res.status(401).json({ message: "Forbidden!" });
      return;
    }
    const result = await database.getDb().collection('articles').updateOne(
      { _id: new ObjectId(articleId) },
      { $pull: { comments: { id: new ObjectId(commentId) } } }
    );
      console.log(result);
    if (result.modifiedCount > 0) {
      return res.status(200).json({ message: "Comment deleted successfully" });
    } else {
      return res.status(404).json({ message: "Comment not found" });
    }
  } catch (error) {
    res.status(500).send("Error: " + error);
  }
});

// Express route handler for liking a comment
router.put('/like', async (req, res) => {
  try {
    const TokenUsername = req.user.username;
    const articleId = req.body.articleId;
    const commentId = req.body.commentId;

    const article = await database.getDb().collection('articles').findOne(
      { _id: new ObjectId(articleId), 'comments.id': new ObjectId(commentId) }
    );

    if (!article || !article.comments) {
      return res.sendStatus(404); // Comment or article not found
    }

    const comment = article.comments.find(c => c.id && c.id.toString() === commentId);

    if (!comment) {
      return res.sendStatus(404); // Comment not found
    }

    const userIndex = comment.likes.users.indexOf(TokenUsername);

    if (userIndex !== -1) {
      // User already liked the comment, remove their like
      comment.likes.users.splice(userIndex, 1);
      comment.likes.count--;
      let userResult = await database.getDb().collection('users').updateOne(
        { username: TokenUsername.toLowerCase() },
        { $inc: { numOfReactions: -1 } }
      );
    } else {
      // User has not liked the comment before, add their like
      comment.likes.users.push(TokenUsername);
      comment.likes.count++;
      let userResult = await database.getDb().collection('users').updateOne(
        { username: TokenUsername.toLowerCase() },
        { $inc: { numOfReactions: 1 } }
      );
    }

    await database.getDb().collection('articles').updateOne(
      { _id: new ObjectId(articleId), 'comments.id': new ObjectId(commentId) },
      { $set: { 'comments.$': comment } }
    );

    res.sendStatus(200); // Like action processed successfully
  } catch (error) {
    console.log(error);
    res.status(500).send("Error: " + error);
  }
});


router.put('/dislike', async (req, res) => {
  try {
    const TokenUsername = req.user.username;
    const articleId = req.body.articleId;
    const commentId = req.body.commentId;
    const user = req.body.user;

    const article = await database.getDb().collection('articles').findOne(
      { _id: new ObjectId(articleId), 'comments.id': new ObjectId(commentId) }
    );

    if (!article || !article.comments) {
      return res.sendStatus(404); // Comment or article not found
    }

    const comment = article.comments.find(c => c.id && c.id.toString() === commentId);

    if (!comment) {
      return res.sendStatus(404); // Comment not found
    }

    const userIndex = comment.dislikes.users.indexOf(TokenUsername);

    if (userIndex !== -1) {
      // User already disliked the comment, remove their dislike
      comment.dislikes.users.splice(userIndex, 1);
      comment.dislikes.count--;
      let userResult = await database.getDb().collection('users').updateOne(
        { username: TokenUsername.toLowerCase() },
        { $inc: { numOfReactions: -1 } }
      );
    } else {
      // User has not disliked the comment before, add their dislike
      comment.dislikes.users.push(TokenUsername);
      comment.dislikes.count++;
      let userResult = await database.getDb().collection('users').updateOne(
        { username: TokenUsername.toLowerCase() },
        { $inc: { numOfReactions: 1 } }
      );
    }

    await database.getDb().collection('articles').updateOne(
      { _id: new ObjectId(articleId), 'comments.id': new ObjectId(commentId) },
      { $set: { 'comments.$': comment } }
    );

    res.sendStatus(200); // Dislike action processed successfully
  } catch (error) {
    res.status(500).send("Error: " + error);
  }
});



module.exports = router;