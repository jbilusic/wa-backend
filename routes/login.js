const { Router } = require('express')
const router = Router();
const bcrypt = require('bcrypt');
const authMiddleware = require('../authMiddleware.js');
const db = require('../database/database');
const jwt = require('jsonwebtoken');
require('dotenv').config()

router.use((req,res,next)=>{
    console.log("Logging login route");
    next();
})

router.post('/signin', async(req,res)=>{
    try {
        let user = await db.getDb().collection('users').findOne({ username: req.body.username.toLowerCase()})
        if(user){
            if(await bcrypt.compare(req.body.password, user.password)){
                const username = req.body.username;
                const token = jwt.sign({ username: username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });   
                return res.status(200).json({ token: token });
                //res.redirect('http://localhost:5173');
                //return res.status(200).json("Radi");
            }
            else{
                console.log("neuspjesan login");
                return res.status(401).json("Bad credentials");
            }       
        }else{
            let admin = await db.getDb().collection('admins').findOne({ username: req.body.username.toLowerCase()})
            if(admin){
                if(req.body.password == admin.password){
                    const username = req.body.username;
                    const token = jwt.sign({ username: username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });   
                    return res.status(200).json({ token: token });
                }
                else{
                    console.log("neuspjesan login");
                    return res.status(401).json("Bad credentials");
                } 
            }
            return res.status(422).json({ error: "Username ne postoji" });
        }    
    } catch (error) {
        res.status(500).send("error:" + error);  
    }
})

router.post('/reg', async(req,res)=>{
    try {
        let user = await db.getDb().collection('users').findOne({ username: req.body.username.toLowerCase()})
        let email = await db.getDb().collection('users').findOne({ email: req.body.email.toLowerCase()})
        if(user==null && email==null){
            const hashedPassword = await bcrypt.hash(req.body.password, 10)
            const  user = 
            {email: req.body.email , username: req.body.username,
            password: hashedPassword}
            let result = await db.getDb().collection('users').insertOne(user)
            return res.status(200).json("Registered");    
        }else{
            return res.status(403).send("That email is already registered in a database");
        }    
    } catch (error) {
        res.status(500).send("error:" + error);  
    }
})

module.exports = router;