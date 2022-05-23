// require express, cors, mongodb, jwt, dotenv and stripe
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
// mongo
// stripe



// declare app and port
const app = express();
const port = process.env.PORT || 5000;



// use middleware
app.use(cors());
app.use(express.json());



// check server root api
app.get('/', (req, res) => {
    res.send('Manufacturer company is ready to supply tools')
});



// listening port
app.listen(port, () => {
    console.log('Manufacturer is listening', port);
})