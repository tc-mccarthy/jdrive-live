var express = require('express'),
	router = express.Router(),
	config = require("../config.js").config,
	youtube = require("../lib/youtube.js").youtube,
	twitter = require("twitter"),
	tw = new twitter(config.twitter);

//Youtube = new youtube(config.youtube.api_key);

/* GET users listing. */
router.get('/', function(req, res) {
  res.send('respond with a resource');
});

router.get("/getClips", function(req, res){
	Youtube.getPlaylist(config.youtube.playlist, function(items){
		res.send(JSON.stringify(items));
	});
});

router.get("/twitter", function(req, res){
	tw.stream("statuses/filter", {"track": "slut"}, function(s){
		s.on("data", function(data){
			console.log(data);
		});
	});
	//res.send(200);
});

module.exports = router;
