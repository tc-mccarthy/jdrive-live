jdrive = {
	refreshRate: 30, //how often to update data elements, in seconds
	
	init: function(){
		$(jdrive.registerElements);
		$(jdrive.videoSetup);
		$(jdrive.startIO);
		//$(jdrive.carousel);
	},

	videoSetup: function(){
		jdrive.mainVideo = new ustream(jdrive.mainVideoContainer);
		jdrive.tweetsContainer.height(jdrive.mainVideoContainer.height());
	},

	registerElements: function(){
		jdrive.tweetsTemplate = _.template($("#tweetTemplate").html());
		jdrive.tweetsContainer = $("#tweets");
		jdrive.tweets = $("#tweets #tweetContent");
		jdrive.mainVideoContainer = $("#mainVideo iframe");
		jdrive.instagramTemplate = _.template($("#instaTemplate").html());
		jdrive.instaContainer = $("#ugc");
	},

	abridge: function(string, wordCount){
		stringArray = string.split(" ");

		if(stringArray.length <= wordCount){
			return string;
		}

		return stringArray.slice(0, wordCount).join(" ");
	},

	startIO: function(){
		jdrive.socket = new io();
		jdrive.socket.emit("connection");
		jdrive.socket.emit("get-tweets");
		jdrive.socket.on("tweet", function(data){
			tweet = JSON.parse(data);
			jdrive.addTweet(tweet);
		});

		//load initial instas
		jdrive.getInstagram();
		
		//load initial tweets
		jdrive.getTweets();

		//reload instas at the refresh rate
		setInterval(jdrive.getInstagram, (jdrive.refreshRate * 1000));
	},	

	addTweet: function(tweet){
		jdrive.tweets.prepend(jdrive.tweetsTemplate({tweet: tweet}));
		var newTweet = $(".tweet.row:eq(0)"),
			lastTweet = $(".tweet.row:gt(" + (settings.twitter.max - 1) + ")");

		newHeight = 0;

		newTweet.children().each(function(){
			newHeight += $(this).height()
		});
		
		lastTweet.remove();
		newTweet.animate({opacity: 1, height: (newHeight * 1.6) + "px"});
	},

	formatTweet: function(text){
		return text.replace(/(https?[:]\/\/[A-Za-z0-9._\-\/]+)/g, "<a href='$1'>$1</a>").replace(/#([A-Za-z0-9_]+)/g, "<a href='http://www.twitter.com/hashtag/$1'>#$1</a>").replace(/@([A-Za-z0-9_]+)/g, "<a href='http://www.twitter.com/$1'>@$1</a>");
	},

	getInstagram: function(){
		$.getJSON("/api/instagram", function(data){
			jdrive.instaContainer.html("");
			_.each(data, function(post){
				jdrive.instaContainer.append(jdrive.instagramTemplate({item: post}));
			});
		});
	},

	getTweets: function(){
		$.getJSON("/api/twitter", function(data){
			_.each(_.first(data.statuses, settings.twitter.max), function(post){
				jdrive.addTweet(post);
			});
		});
	},

	breakHash: function(text){
		return text.replace(/([^\s])[#]/g, "$1 #");
	}
};

jdrive.init();
settings = JSON.parse(settings);