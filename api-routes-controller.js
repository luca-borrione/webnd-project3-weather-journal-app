require('dotenv').config();
const fetch = require('node-fetch');

const { BASE_URL = 'http://api.openweathermap.org/data/2.5/weather' } = process.env;
const { APP_ID } = process.env;

const projectData = [];

module.exports = {
  getAll: (req, res) => {
    res.send(projectData);
  },
  getSearch: async (req, res, next) => {
    try {
      const searchString = `q=${req.query.city}`;
      const response = await fetch(`${BASE_URL}?appid=${APP_ID}&${searchString}`);
      const results = await response.json();
      if (response.status !== 200) {
        next(results.message);
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
      next(err);
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },
  postAdd: (req, res) => {
    const entry = req.body;
    projectData.push(entry);
    res.json({ success: true });
  },
};
