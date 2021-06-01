require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const apiRoutes = require('./api-routes');

const { PORT = 3000 } = process.env;

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.use(express.static('public'));

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

app.use('/api', apiRoutes);
// console.log('>> app', app);

// Callback function to complete GET '/all'

// Post Route

module.exports = {
  app,
  server,
  routeHandlers,
};
