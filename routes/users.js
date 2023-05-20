const express = require('express');
const router = express.Router();
const database = require('../database/database');
const userSchema = require('../schemas/UsersSchema');
const bcrypt = require('bcrypt');

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
    if(user==""){
        console.log("taj username ne postoji u bazi");
        res.status(404).send("Ne postoji");
        return;
    }
    res.status(200).send(user);
})

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
        if(email!=""){
            console.log("Email je vec registriran");
            res.status(403).json({ message: "Email vec postoji!"});
            return;
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        let user = new userSchema();
        user.email=req.body.email;
        user.password = hashedPassword;
        user.username = req.body.username

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



module.exports = router;