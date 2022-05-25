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



// verify jwt

function verifyJWT(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized Access' });
    }
    const token = authHeader.split(' ')[1];

    // verify jwt
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {

        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' });
        }

        else {
            req.decoded = decoded;
            // console.log(decoded);
            next();
        }
    })
}



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

        // create user collection
        const userCollection = client.db("tools_manufacturer").collection("users")



        /* ----- USERS COLLECTION API ----- 
        -----------------------------------*/


        // get all users [only admin can access this]
        // link: http://localhost:5000/users


        app.get('/users', async (req, res) => {

            const users = await userCollection.find().toArray();
            res.send(users);
        })



        // update user and issue token

        // update user information [create new or update/modify]
        // link: http://localhost:5000/user/${email}


        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };

            // create a document that sets the user data
            const updateDoc = {
                $set: user
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);

            // token issue
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });

            res.send({ result, token });
        });



        // verify admin

        const verifyAdmin = async (req, res, next) => {
            const requester = req.decoded.email;
            // console.log(requester);
            const requesterAccount = await userCollection.findOne({ email: requester });
            // console.log(requesterAccount);

            if (requesterAccount.role === 'admin') {
                next();
            }
            else {
                res.status(403).send({ message: 'Forbidden' });
            }
        }





        // get make admin request and create admin a user
        // link: http://localhost:5000/user/admin/${email}


        app.put('/user/admin/:email', verifyJWT, verifyAdmin, async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };

            // create a document that sets the user's updated data
            const updateDoc = {
                $set: { role: 'admin' }
            };

            // update user
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);

        })




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


        // get bookings for specific user
        // link: http://localhost:5000/orders?buyer=${email}


        app.get('/orders', async (req, res) => {

            const buyer = req.query.buyer;
            const query = { buyer: buyer };
            const orders = await orderCollection.find(query).toArray();
            res.send(orders);
        })


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