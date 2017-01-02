## URL Shortener

This application will take a URL and respond with a shortened version via a JSON response.

### How to run locally

Prerequisites

* Node v7.2.1^

Run the application.

    npm install
    npm run build
    npm start

#### Example usage

`https://honey-i-shrunk-the-url.herokuapp.com/medium.com/@sok213`

#### Example output

`{"original_url":"medium.com/@sok213","short_url":"https://honey-i-shrunk-the-url.herokuapp.com/44cc0e"}`


>Note: "Shortened" version of the URL is not actually shorter than originally provided URL. This project is intended to simulate how to chain two links together and store the pair of URL addresses via MongoDB. 