var express = require('express'),
	router = express.Router(),
	config = require("../config.js").config;

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express', settings: config.app, hashtag: config.twitter.hashtag });
});

module.exports = router;
