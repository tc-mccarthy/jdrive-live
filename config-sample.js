exports.config = {
	app:{
		port: 9000,
		home: "/",
		ustream: {
			videoid: 12313488 //ustream video id
		},
		twitter: {
			max: 5
		}
	},

	twitter: {
	  consumer_key: '',
	  consumer_secret: '',
	  access_token_key: '',
	  access_token_secret: '',
	  hashtag: "#Isles"
	},

	memcached: {
		host: 'localhost',
		port: 11211
	},

	instagram: {
		client_id: '',
		client_secret: ''
	}
};