'use strict';

var http = require('http'),
    url = require('url'),
    port = process.env.PORT || 3000;

var testObj = void 0;

function onRequest(req, res) {
	console.log('Listening on port: ' + port);
	var parsed = url.parse(req.url).href.split('/').join('');
	console.log("parsed :" + parsed);

	// Use connect method to connect to the Server
	MongoClient.connect(mongoLabUrl, function (err, db) {
		if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		} else {
			(function () {
				console.log('Connection established to', mongoLabUrl);

				// do some work here with the database.
				testObj = { "original_url": parsed, "short_url": "N/A" };

				var urlbank = db.collection('urlbank');
				//urlbank.insert(testObj);
				var getId = [];
				urlbank.find({ "original_url": "google.com" }).map(function (d) {
					getId.push(d.original_url);
					//console.log("d: "+d)
				});

				console.log(getId);

				/*urlbank.update({ 
    	"original_url": parsed}, 
    	$set: { "short_url": getid._id}
    );*/

				//Close connection
				db.close();

				//Sets the response type.
				res.writeHead(200, { 'Content-Type': 'text/plain' });
				//res.write(JSON.stringify(testObj));
				//End the res.
				res.end();
			})();
		}
	});
}

//lets require/import the mongodb native drivers.
var mongodb = require('mongodb');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

// Connection URL. This is where your mongodb server is running.

//(Focus on This Variable)
var mongoLabUrl = process.env.MONGOLAB_URI;
//(Focus on This Variable)


//Create the http server.
http.createServer(onRequest).listen(port);

//DELETE THIS BEFORE PUSH
// export MONGOLAB_URI="mongodb://sok213:planetx213@ds145158.mlab.com:45158/urlstorage"