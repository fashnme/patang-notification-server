// Inject dotenv environment 
require('dotenv').config();

//Core Library Imports
const http = require('http');

//External Library Imports
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const router = require('./router');

//Initializing Express App
var app = express();

//Create Server using http
var server = http.createServer(app);
server.timeout = 30000;


//Registering Middleware
app.use(bodyParser.json({ type: '*/*', limit: '50mb', parameterLimit: 50000 }));
// app.use(morgan('dev'));
app.use(express.static(__dirname + '/public'));
app.use(cors({ origin: "*" }));

router(app);

const port = process.env.PORT || 3465;

server.listen(port, () => {
    console.log(`\x1b[1mServer Started at Port: ${port}`);
});