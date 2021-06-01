require('dotenv').config();
const fetch = require('node-fetch');

const BASE_URL = 'http://api.openweathermap.org/data/2.5/weather';
const { APP_ID } = process.env;

module.exports = {
  getSearch: async (req, res) => {
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
  },
};
