const express = require('express');
const { getSearch } = require('./api-controller');

const router = express.Router();

router.route('/search').get(getSearch);

module.exports = router;
