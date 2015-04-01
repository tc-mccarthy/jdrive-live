var express = require('express'),
	router = express.Router(),
	config = require("../config.js").config,
	youtube = require("../lib/youtube.js").youtube;

Youtube = new youtube(config.youtube.api_key);

/* GET users listing. */
router.get('/', function(req, res) {
  res.send('respond with a resource');
});

router.get("/getClips", function(req, res){
	Youtube.getPlaylist(config.youtube.playlist, function(items){
		res.send(JSON.stringify(items));
	});
});

module.exports = router;
