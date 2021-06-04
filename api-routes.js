const express = require('express');
const { getAll, getSearch, postAdd } = require('./api-routes-controller');

const router = express.Router();

router.route('/add').post(postAdd);
router.route('/all').get(getAll);
router.route('/search').get(getSearch);

module.exports = router;
