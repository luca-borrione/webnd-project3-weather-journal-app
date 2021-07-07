require('dotenv').config();
const fetch = require('node-fetch');

const BASE_URL = 'http://api.openweathermap.org/data/2.5/weather';
const { APP_ID } = process.env;

let projectData = [];

module.exports = {
  getAll: (_, res) => {
    res.send(projectData);
  },
  getSearch: async (req, res, next) => {
    try {
      const { lang, zip } = req.query;
      const params = {
        appid: APP_ID,
        units: 'imperial',
        lang,
        zip,
      };
      const response = await fetch(`${BASE_URL}?${new URLSearchParams(params).toString()}`);
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
    projectData = projectData.filter(({ id }) => id !== entry.id);
    projectData.push(entry);
    res.json({ success: true });
  },
};
