jdrive = {
	refreshRate: 30, //how often to update data elements, in seconds
	
	init: function(){
		$(jdrive.registerElements);
		$(jdrive.videoSetup);
		$(jdrive.getClips);
		//$(jdrive.carousel);
	},

	videoSetup: function(){
		jdrive.mainVideo = new ustream(jdrive.mainVideoContainer);
		jdrive.clipsContainer.height(jdrive.mainVideoContainer.height());
	},

	registerElements: function(){
		jdrive.clipsTemplate = _.template($("#clipTemplate").html());
		jdrive.clipsContainer = $("#clips");
		jdrive.clips = $("#clips .row");
		jdrive.mainVideoContainer = $("#mainVideo iframe");
	},

	abridge: function(string, wordCount){
		stringArray = string.split(" ");

		if(stringArray.length <= wordCount){
			return string;
		}

		return stringArray.slice(0, wordCount).join(" ");
	},

	getClips: function(){
		$.getJSON(settings.home + "api/getClips", function(data){
			jdrive.clips.html(" ");
			_.each(data, function(value){
				jdrive.clips.append(jdrive.clipsTemplate({item: value}));
			});
		}).done(function(){
			//run this function again after the refresh rate
			setTimeout(jdrive.getClips, jdrive.refreshRate * 1000);
		});
	},

	carousel: function(){
		$('#carousel').carouFredSel({
	        items: 4,
	        auto: false,
	        circular: true,
	        infinite: true,
	        direction: "left",

	        scroll: {
	            items: 4,
	        }
	    });
	}
};

jdrive.init();
settings = JSON.parse(settings);