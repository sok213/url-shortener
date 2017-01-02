const http = require('http'),
	url = require('url'),
	port = process.env.PORT || 3000,
	hostURL = "https://honey-i-shrunk-the-url.herokuapp.com/";

function onRequest(req, res) {
	//Stores the current URL address.
	const parsed = url.parse(req.url).href.split('/').join('').toLowerCase();

	//Sets the response type.
	res.writeHead(200, {'Content-Type': 'text/plain'});

	// Use connect method to connect to the Server
	MongoClient.connect(mongoLabUrl, (err, db) => {
		//Error handler.
		if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		} else {
			console.log('Connection established to', mongoLabUrl);

			//Retrieve the collection from the mLab database.
			let urlbank = db.collection('urlbank');
			checkIfShortURL();

			//Checks to see if the client's URL is a pre-existing short URL within the database.
			function checkIfShortURL() {
				urlbank.find({"short_url": hostURL + parsed}).count((err, count) => {
					// If url is not a short url, check if it is a valid URL address to be processed as a new document.
					// Else, redirect the client the the original_url.
					if(count == 0) {
						urlFormatValidation();
					} else {
						redirectUser();
					}
				});
			}

			function redirectUser() {
				urlbank.find({"short_url": hostURL + parsed}).forEach(d => {
					res.writeHead(301,
					  { Location: d.link_address }
					);
					db.close();
					res.end();
				})
			}

			//Checks to see if the client's URL is a valid address. 
			function urlFormatValidation() {
				let urlInspect = parsed.split("."),
						formattedURL = "http://www." + urlInspect[urlInspect.length - 2] + "." + urlInspect[urlInspect.length - 1];

				//If URL has greater than or less than 3 dots, it is considered an invalid URL address.
				if(urlInspect.length > 3 || urlInspect.length <= 1) {
					res.write('{"error": "Invalid URL, please provide a valid URL address!"}');
					db.close();
					res.end();
				} else {
					checkForExistingURL(formattedURL);
				}
			}

			//Checks to see if the URL already exists in database, if not, add it. Else, do nothing.
			function checkForExistingURL(f_URL) {
				urlbank.find({"original_url": parsed}).count((err, count) => {
					//if URL does not exist, run insertNewURL(), else run returnFoundDoc().
					if(count == 0) {
						insertNewURL(f_URL);
					} else {
						//Send the client the response object.
						returnFoundDoc(f_URL);
						db.close();
					}
				});
			}

			//This function will find the pre-existing URL and return the reponse to the client.
			function returnFoundDoc(f_URL) {
				urlbank.find({"original_url": parsed}).forEach( d => {
					//Send back the pre-existing URL to client.
					const responseURL = {
						"original_url": f_URL,
						"short_url": d.short_url
					};

					res.write(JSON.stringify(responseURL));
					res.end();
				});
			}

			//This function will create the new URL object and insert it into the database.
			function insertNewURL(f_URL) {
				let getId = [];
				//Gets the url and insterts it into the database.
				urlbank.insert(
					{	
						"original_url": parsed,
						"link_address": "N/A",
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
							$set: { 
								"short_url": hostURL + JSON.stringify(getId).substring(20, 26),
								"link_address": f_URL
							}
						}
					);

					//Sets a clone object of the url data object to be used as a response.
					let newUrlObj = {
						"original_url": parsed,
						"short_url": hostURL + JSON.stringify(getId).substring(20, 26)
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