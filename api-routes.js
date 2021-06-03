const express = require('express');
const { getAll, getSearch } = require('./api-routes-controller');

const router = express.Router();

router.route('/all').get(getAll);
router.route('/search').get(getSearch);

module.exports = router;
