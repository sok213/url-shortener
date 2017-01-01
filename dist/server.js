'use strict';

var express = require('express'),
    ejs = require('ejs'),
    app = express(),
    path = require('path'),
    http = require('http').Server(app),
    url = require('url'),
    port = process.env.PORT || 3000,
    routes = require('./routes/index');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//Pipe the css
app.use('/', express.static('public'));
//calls the routes javascript file.
app.get('/', routes);

function onRequest(req, res) {
	console.log('Listening on port: ' + port);
	var parsed = url.parse(req.url).href.split('/').join('');
	console.log("parsed :" + parsed);
}

//lets require/import the mongodb native drivers.
var mongodb = require('mongodb');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

// Connection URL. This is where your mongodb server is running.

//(Focus on This Variable)
var mongoLabUrl = process.env.MONGOLAB_URI;
//(Focus on This Variable)

// Use connect method to connect to the Server
MongoClient.connect(mongoLabUrl, function (err, db) {
	if (err) {
		console.log('Unable to connect to the mongoDB server. Error:', err);
	} else {
		console.log('Connection established to', mongoLabUrl);

		// do some work here with the database.

		//Close connection
		db.close();
	}
});

//Create the http server.
//http.createServer(onRequest).listen(port);
//console.log('Server is now running on port: ' + port);

http.listen(port, function () {
	console.log('Listening on port: ' + port);
});