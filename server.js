const http = require('http'),
	url = require('url'),
	port = process.env.PORT || 3000;

let testObj;

function onRequest(req, res) {
	let parsed = url.parse(req.url).href.split('/').join('');

	// Use connect method to connect to the Server
	MongoClient.connect(mongoLabUrl, function (err, db) {
		if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		} else {
			console.log('Connection established to', mongoLabUrl);

			//Declare variables.
			let urlbank = db.collection('urlbank'),
				getId = [],
				newUrlObj,
				existCheck;

			//Checks to see if the URL already exists in database, if not, add it. Else, do nothing.
			urlbank.find({"original_url": parsed}).count((err, count) => {
				console.log('WTF:' + count);
				if(count == 0) {
					addUrlObject();
				} else {
					db.close();
				}
			})

			function addUrlObject() {
				//Gets the url and insterts it into the database.
				urlbank.insert(
					{	
						"original_url": parsed,
						"short_url": "N/A"
					}
				)

				//Finds the recently added url and updates the short_url with the given _id value.
				urlbank.find({ "original_url": parsed }).forEach(d => {
					//Pushes object id to getId variable.
					getId.push(d._id);
					//Updates the short_url key value.
					urlbank.update(
						{ "original_url": parsed }, 
						{
							$set: { "short_url": JSON.stringify(getId).substring(20, 26) }
						}
					);

					//Sets a clone object of the url data object to be used as a response.
					newUrlObj = {
						"original_url": parsed,
						"short_url": JSON.stringify(getId).substring(20, 26)
					};

					//Close connection
					db.close();
					console.log('NEW OBJECT: ' + JSON.stringify(newUrlObj));
					//Sets the response type.
					res.writeHead(200, {'Content-Type': 'text/plain'});
					//Send the client the response object.
					res.write(JSON.stringify(newUrlObj));
					//End the res.
					res.end();
				});
			}
		}
	});
}

//lets require/import the mongodb native drivers.
const mongodb = require('mongodb');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
const MongoClient = mongodb.MongoClient;

// Connection URL. This is where your mongodb server is running.

//(Focus on This Variable)
const mongoLabUrl = process.env.MONGOLAB_URI;      
//(Focus on This Variable)


//Create the http server.
http.createServer(onRequest).listen(port);