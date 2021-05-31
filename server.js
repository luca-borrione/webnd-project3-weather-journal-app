// Setup empty JS object to act as endpoint for all routes

// Express to run server and routes
const express = require('express');

// Start up an instance of app
const app = express();

/* Dependencies */

/* Middleware */

// Here we are configuring express to use body-parser as middle-ware.
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cors for cross origin allowance
const cors = require('cors');

app.use(cors());

// Initialize the main project folder
app.use(express.static('website'));

// Spin up the server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`server running on localhost ${PORT}`);
});

// Callback to debug
const routeHandlers = {};

routeHandlers['/'] = (req, res) => {
  res.send('index.html');
};

// Initialize all route with a callback function
app.get('/', routeHandlers['/']);

// Callback function to complete GET '/all'

// Post Route

module.exports = {
  app,
  server,
  routeHandlers,
};
