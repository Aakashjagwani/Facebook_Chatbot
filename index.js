var express = require('express');   //A fast web application framework that works on the fly.
var bodyParser = require('body-parser'); 
var request = require('request');
var app = express(); 

app.use(bodyParser.urlencoded({extended: false})); 
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));  //Port no to listen on local server.

// GET request to check if server is up and running
app.get('/', function (req, res) {
    res.send('This is TestBot Server');
});

// GET request for testing  the Facebook Webhook
app.get("/webhook", function (req, res) {
  if (req.query["hub.verify_token"] === "Any_String_will_work") {   //random String to be tested with facebook verify_token 
    console.log("Verified webhook"); 
    res.status(200).send(req.query["hub.challenge"]);  //should be same in the Facebooks webhook API verification token #i Wasted 2 hours After this..
  }  else {
    console.error("Verification failed. The tokens do not match.");
    res.sendStatus(403);

    }
});

//We can handle different messages by using different apis and handle large number of customers.
// handler receiving messages
app.post('/webhook', function (req, res) {
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
        var event = events[i];
        if (event.message && event.message.text) {
            sendMessage(event.sender.id, {text: "Echo: " + event.message.text});
        }
    }
    res.sendStatus(200);
});
// generic function sending messages
function sendMessage(recipientId, message) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',  //URL which generates messages from the server. 
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},  //Access token generated from FB`s API by creating a page and should be put here. 
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message: message,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};
