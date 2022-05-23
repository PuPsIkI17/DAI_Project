const mongoose = require("mongoose");
const mongodb = require("mongodb");
require("dotenv").config();

async function makeDb () {
    /*const MongoClient = mongodb.MongoClient
    const url = process.env.DATABASE_URL
    const dbName = 'meals_api'
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true })
    await client.connect()
    // Alert on connection*/
    //const db = await client.db(dbName)
    //db.makeId = makeIdFromString

    const db = await (await mongoose
    .connect('mongodb://127.0.0.1:27017/meals_api', 
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    )).connection;

    db.on('error', (error) => console.log(error));
    db.once('open', () => console.log('Connected to mongo'));

    console.log("db connected");
    return db
}

function makeIdFromString (id) {
    return new mongodb.ObjectID(id)
}

module.exports = makeDb;
