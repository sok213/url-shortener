const http = require('http'),
	url = require('url'),
	port = process.env.PORT || 3000;

function onRequest(req, res) {
	const parsed = url.parse(req.url).href.split('/').join('');

	//Sets the response type.
	res.writeHead(200, {'Content-Type': 'text/plain'});

	// Use connect method to connect to the Server
	MongoClient.connect(mongoLabUrl, (err, db) => {
		if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		} else {
			console.log('Connection established to', mongoLabUrl);

			//Store the url address parameter.
			let urlbank = db.collection('urlbank');

			function checkIfShortURL() {
				urlbank.find({"short_url": "http://localhost:3000/" + parsed}).count((err, count) => {
					// If url is not a short url, check if it is a valid URL address to be processed as a new document.
					if(count == 0) {

					} else {

					}
				});
			}

			function urlFormatValidation(clientUrl) {

			}

			//Checks to see if the URL already exists in database, if not, add it. Else, do nothing.
			function checkForExistingURL() {
				urlbank.find({"original_url": parsed}).count((err, count) => {
					//if URL does not exist, run insertNewURL(), else run returnFoundDoc().
					if(count == 0) {
						insertNewURL();
					} else {
						//Send the client the response object.
						returnFoundDoc();
						db.close();
					}
				});
			}

			//This function will find the pre-existing URL and return the reponse to the client.
			function returnFoundDoc() {
				urlbank.find({"original_url": parsed}).forEach( d => {
					//Send back the pre-existing URL to client.
					const responseURL = {
						"original_url": d.original_url,
						"short_url": d.short_url
					};

					res.write(JSON.stringify(responseURL));
					res.end();
				});
			}

			//This function will create the new URL object and insert it into the database.
			function insertNewURL() {
				let getId = [];
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
							$set: { "short_url": "http://localhost:3000/" + JSON.stringify(getId).substring(20, 26) }
						}
					);

					//Sets a clone object of the url data object to be used as a response.
					let newUrlObj = {
						"original_url": parsed,
						"short_url": "http://localhost:3000/" + JSON.stringify(getId).substring(20, 26)
					};

					//Close connection
					db.close();
					console.log('NEW OBJECT INSERTED: ' + JSON.stringify(newUrlObj));
					//Send the client the response object.
					res.write(JSON.stringify(newUrlObj));
					//End the res.
					res.end();
				});
			} //End of insertNewURL() function.
		} //End of else closing bracket.
	}); //End of MongoClient connect function.
} //End of onRequest() function.

//lets require/import the mongodb native drivers.
const mongodb = require('mongodb');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
const MongoClient = mongodb.MongoClient;

//Retrieves my personal mLAB database URL via the process invironment variable.
const mongoLabUrl = process.env.MONGOLAB_URI;      

//Create the http server.
http.createServer(onRequest).listen(port);