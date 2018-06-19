'use strict'
//Configs
const config = require("./config.json")
const PORT = process.env.PORT || 3000;
const URL = process.env.URL || 'https://techninjas.herokuapp.com';

//Decoding module
const base64 = require('base-64');
const uuid = require('uuid/v1');

// DB initialization
const db = require('./db/client');

//Server init
const express = require('express');
const bodyParser = require('body-parser');
const server = express();
const request = require("request");

const Botly = require("botly");
const botly = new Botly({
    accessToken: config.accessToken, // page access token provided by facebook
    verifyToken: config.verifyToken, // needed when using express - the verification token you provided when defining the webhook in facebook
    notificationType: Botly.CONST.REGULAR, // already the default (optional)
    FB_URL: 'https://graph.facebook.com/v2.6/' // this is the default - allows overriding for testing purposes
});

//Setting up server
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: false }));
server.use("/facebook/webhook", botly.router());

const bundle = { server, request, db, botly, base64, config }
const bot = new (require('./bot'))(bundle)

bot.restoreApproveChecking()

// Adds support for GET requests to our webhook
server.get('/facebook/webhook', (req, res) => {
    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === config.verifyToken) {

            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
});

const order = new (require('./routes/order'))(Object.assign(bundle, { bot }));
server.use('/order', order.getRoute());

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

/* let obj = {
    orderId: 'test1', 
    email: "test1@gmail.com", 
    url: 'https://www.npmjs.com/'
}

obj = JSON.stringify(obj)
obj = base64.encode(obj)
console.log(obj) */