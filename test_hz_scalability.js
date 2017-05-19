var util = require('util')
var cluster = require('cluster');

var schedule = require('node-schedule');
var numCPUs = require("os").cpus().length;
var socketCluster = require('socketcluster-client');


var clientModule = {
	// var self = this,

	init: function(options, cb) {

		var socket = socketCluster.connect(options);		
		return cb(null, socket); 
	},

	subscribe: function(socket, channel_name, cb) {
		
		var chatChannel = socket.subscribe(channel_name);
		return cb(null, chatChannel);
	},

	send: function(socket, data, cb) {
		
		socket.emit('chat', data);
		return cb(null, null);
		// var self = this;
		// console.log(self);
		// var chatChannelobj = data.chatChannel;
		// self.listen(chatChannelobj, cb);
		// return cb;
	},

	listen: function(options, chatChannelobj, cb) {
		
		chatChannelobj.watch(function(data) {
			console.log('Chat from other subscribers: ', data);
			return cb(null, data);
		})
	},

	goForIt: function(options, channlName, msgData) {
		var self = this;
		self.init(options, function(err, socket) {
			if(err) {
				console.log(err);
			} else {
				var channel_name =/* process.argv[2] || */channlName || 'chann';
				self.subscribe(socket, channel_name, function (err, chatChannel) {
					if(err) {
						console.log(err); 
					} else {
						var data = {
							msg:  /*process.argv[3] ||*/ msgData || 'hello_there',
							channel_name: channel_name,
						};

						chatChannel.watch(function(res) {
							console.log(res);
						});

						self.send(socket, data, function(err, msg){
							console.log('msg send successfully');
						});
					}
				});
			}
		});
	}

}

module.exports = clientModule;



/* ************************** test drive **********************/

if(require.main == module) {

	var options = {
		'hostname':'192.168.99.100', 
		port: 8000
	}

	// var cl = clientModule;
	// if (cluster.isMaster) {
	//   for (var i = 0; i < 1000; i++) {
	//     cluster.fork();
	//   }

	//   cluster.on("exit", function(worker, code, signal) {
	//     cluster.fork();
	//   });
	// } else {
	// 	var msgData = 'hello_there';
	// 	cl.goForIt(options,i, msgData);
	//   // http.createServer(function(request, response) {
	//   //   console.log("Request for:  " + request.url);
	//   //   response.writeHead(200);
	//   //   response.end("hello world\n");
	//   // }).listen(port);
	// }
	// for(var i=1;i<=10;i++) {
		var cl = clientModule;
		var msgData = 'hello_there';
		cl.goForIt(options,1, msgData);
	// }
}


/*
TODO:
1. make the chat continous through terminal
2. pass every variable through argv . i.e the msg and the channel etc
3. make 100 concurrent channels 
*/