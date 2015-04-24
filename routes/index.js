var express = require('express'),
	router = express.Router(),
	config = require("../config.js").config;

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Roth Regatta Live 2015', settings: config.app, hashtag: config.twitter.hashtag });
});

router.get("/robots.txt", function(req, res){
	if(req.headers.host !== config.app.hosts.prod){
		res.type('text/plain');
		res.send("User-agent: *\nDisallow: /");
	} else{
		res.send(404);
	}
});

router.get("/googleb922c62c3db3c863.html", function(req, res){
	res.send("google-site-verification: googleb922c62c3db3c863.html");
});

module.exports = router;
