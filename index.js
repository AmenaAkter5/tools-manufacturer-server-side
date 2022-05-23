// require express, cors, mongodb, jwt, dotenv and stripe
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
// stripe



// declare app and port
const app = express();
const port = process.env.PORT || 5000;



// use middleware
app.use(cors());
app.use(express.json());



// connect with mongo database

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wgfl4.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



// set connection function
async function run() {
    try {
        await client.connect();

        // tools collection
        const toolsCollection = client.db("tools_manufacturer").collection("tools");
    }

    finally {
        // client.close();
    }
}


run().catch(console.dir);




// check server root api
app.get('/', (req, res) => {
    res.send('Manufacturer company is ready to supply tools')
});



// listening port
app.listen(port, () => {
    console.log('Manufacturer is listening', port);
})