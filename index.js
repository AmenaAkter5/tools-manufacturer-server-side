// require express, cors, mongodb, jwt, dotenv and stripe
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

        // purchase order collection
        const orderCollection = client.db("tools_manufacturer").collection("orders");



        /* ----- TOOLS COLLECTION API ----- 
        -----------------------------------*/


        // get all tools
        // link: http://localhost:5000/tools

        app.get('/tools', async (req, res) => {
            const query = {};
            const cursor = toolsCollection.find(query);
            const tools = await cursor.toArray();
            res.send(tools);
        });


        // get a specific tool by id
        // link: http://localhost:5000/tools/${id}

        // app.get('/tools/:id', verifyJWT, async (req, res) => {
        app.get('/tools/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const tool = await toolsCollection.findOne(query);
            res.send(tool);
        });


        // update data : update a tool's quantity after getting order
        // link: http://localhost:5000/tools/${_id}

        app.put('/tools/:id', async (req, res) => {

            const id = req.params.id;
            const updatedItem = req.body;

            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };

            const updatedDoc = {
                $set: {
                    available: updatedItem.quantity,
                }
            };
            const result = await toolsCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })




        /* ----- ORDER COLLECTION API ----- 
        -----------------------------------*/


        // post orders
        // link: http://localhost:5000/orders


        // order set
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        })


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