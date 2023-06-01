const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://jbilusic:DZAi9ism3xDBRBb2@cluster0.f4uuk2i.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
let database;

const connectToServer=  async()=>{
    try{
        await mongoose.connect(uri);
        console.log("spojen na bazu");
        database= client.db("WebNews");
        } catch (error) {
        console.log(error);
        } 
} 

const getUri =()=>{    
    return uri;
}
const getCollectionSession =()=>{
    return "MySessions";
}
const getDb = ()=>{
return database;
}
module.exports = {getUri, getCollectionSession, connectToServer, getDb };

