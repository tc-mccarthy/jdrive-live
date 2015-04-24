var express = require('express'),
	router = express.Router(),
	config = require("../config.js").config,
	youtube = require("../lib/youtube.js").youtube,
	twitter = require("twitter"),
	async = require("async"),
	Memcached = require("memcached"),
	memcached = new Memcached(config.memcached.host + ":" + config.memcached.port),
	tw = new twitter(config.twitter),
	ig = require('instagram-node').instagram();

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

router.get("/instagram", function(req, res){
	ig.use(config.instagram);

	async.waterfall([

		//check memcached first
		function(cb){
			memcached.get('insta', cb);
		},

		function(data, cb){
			//if the data isn't in memcached, fetch it from instagram
			if(typeof data === "undefined"){
				cb(null);
			} else{
				//otherwise, handoff to final callback
				cb('ok', data);
			}
		},

		function(cb){
			ig.tag_media_recent(config.instagram.hashtag.replace("#", ""), [], cb);
		},

		function(medias, pagination, remaining, limit, cb){
			cb(null, JSON.stringify(medias));
		},

		function(results, cb){
			memcached.set("insta", results, config.memcached.timeout, function(err){
				if(err) throw err;
				cb(null, results);
			});
		}
	], function(err, data){
		if(err && err !== 'ok'){
			throw err;
		}

		if(err === 'ok'){
			console.log("From cache");
		} else{
			console.log("From API");
		}

		res.send(data);
	});
});

router.get("/twitter", function(req, res){
	
	async.waterfall([

		//check memcached first
		function(cb){
			memcached.get('twitter', cb);
		},

		function(data, cb){
			//if the data isn't in memcached, fetch it from instagram
			if(typeof data === "undefined"){
				cb(null);
			} else{
				//otherwise, handoff to final callback
				cb('ok', data);
			}
		},

		function(cb){
			tw.get('search/tweets', {q: config.twitter.hashtag}, cb);
		},

		function(tweets, response, cb){
			cb(null, JSON.stringify(tweets));
		},

		function(results, cb){
			memcached.set("twitter", results, config.memcached.timeout, function(err){
				if(err) throw err;
				cb(null, results);
			});
		}
	], function(err, data){
		if(err && err !== 'ok'){
			throw err;
		}

		if(err === 'ok'){
			console.log("From cache");
		} else{
			console.log("From API");
		}

		res.send(data);
	});
});


module.exports = router;
