const fetch = require('node-fetch');

require('dotenv').config();

console.log('>> process', process.env);

// Setup empty JS object to act as endpoint for all routes

// Express to run server and routes
const express = require('express');

const BASE_URL = 'http://api.openweathermap.org/data/2.5/weather';
const { APP_ID } = process.env;

console.log('>> APP_ID', APP_ID);

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
app.use(express.static('public'));

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

app.get('/api/search', async (req, res) => {
  try {
    const searchString = `zip=${req.query.zip}`;
    const response = await fetch(`${BASE_URL}?appid=${APP_ID}&${searchString}`);
    console.log('>> response', response);
    const results = await response.json();
    if (response.status !== 200) {
      return res.status(response.status).json({
        success: false,
        message: results.message,
      });
    }
    return res.json({
      success: true,
      results,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// Callback function to complete GET '/all'

// Post Route

module.exports = {
  app,
  server,
  routeHandlers,
};
