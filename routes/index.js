var express = require('express'),
	router = express.Router(),
	config = require("../config.js").config,
	sequelize = require("sequelize"),
	wp = new sequelize("tc_managed", config.wp.user, config.wp.pass, {host: config.wp.host, port: config.wp.port}),
	posts 			   = wp.import(__dirname + "/../models/posts.js"),
	postmeta		   = wp.import(__dirname + "/../models/postmeta.js"),
	async = require("async");

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Roth Regatta Live 2015', settings: config.app, hashtag: config.twitter.hashtag });
});

router.get("/:slug/", function(req, res){
	var content = {};
	async.waterfall([
		function(x){
			posts.findOne({where: {post_name: req.params.slug, post_type: 'live_show', post_status: 'publish'}}).then(function(a){
				if(a === null){
					x(404);
				} else{
					x(null, a);
				}
			});
		},

		function(post, x){
			content["post_content"] = post.post_content;
			content["post_title"] = post.post_title;
			wp.query("SELECT * FROM tc_managed.wp_25_postmeta WHERE post_id = :postID AND (meta_key NOT LIKE \"\\_%\" OR meta_key LIKE \"\\_yoast%\")", {replacements: {postID: post.ID}, type: sequelize.QueryTypes.SELECT }).then(function(a){
				x(null, a);
			});
		},

		function(results, x){
			async.each(results, function(row, nextRow){
				content[row.meta_key] = row.meta_value;
				nextRow();
			}, function(err){
				x(null);
			});
		}

	], function(err, result){
		if(err){
			res.send(err);
		} else{
			res.render('index', { title: 'Roth Regatta Live 2015', settings: config.app, content: content });
		}
	});
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
