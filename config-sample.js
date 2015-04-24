exports.config = {
	app:{
		port: 9001,
		home: "/",
		ustream: {
			videoid: 12313488 //ustream video id
		},
		twitter: {
			max: 5
		},

		hosts:{
			prod: "",
			dev: "",
			local: ""
		},

		analytics:{
			ga:{
				id: ""
			}
		}
	},

	twitter: {
		consumer_key: '',
		consumer_secret: '',
		access_token_key: '',
		access_token_secret: '',
		hashtag: "#"
	},

	memcached: {
		host: 'localhost',
		port: 11211,
		timeout: 60 //cache life, in seconds
	},

	instagram: {
		client_id: '',
		client_secret: '',
		hashtag: "#"
	}
};