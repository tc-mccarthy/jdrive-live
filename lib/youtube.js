var request = require("request"),
	async = require("async");

var youtube = function(api_key){
	this.api_key = api_key;
};

youtube.prototype.getPlaylist = function(playlistID, cb){
	request.get("https://www.googleapis.com/youtube/v3/playlistItems?playlistId=" + playlistID + "&part=snippet&key=" + this.api_key, function(err, response, body){
		var data = JSON.parse(body),
			clips = [];

		async.each(data.items, function(clip, nextClip){
			clips.push({
				title: clip.snippet.title,
				thumb: clip.snippet.thumbnails.high.url,
				description: clip.snippet.description,
				videoID: clip.snippet.resourceId.videoId
			});

			nextClip();
		}, function(){
			cb(clips);
		});

	});
};

exports.youtube = youtube;