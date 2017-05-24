var util = require('util')
var cluster = require('cluster');

var schedule = require('node-schedule');
var numCPUs = require("os").cpus().length;
var socketCluster = require('socketcluster-client');
var async = require('async');


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
				var channel_name =/* process.argv[2] || */channlName || 'broadcast';
				self.subscribe(socket, channel_name, function (err, chatChannel) {
					if(err) {
						console.log(err); 
					} else {
						// for(var t=1;t<=2;t++) {
							var cntr = 0;
							setInterval(function () {
								cntr++; 
								var data = {
									msg:  /*process.argv[3] ||*/ msgData || 'hello_there',
									channel_name: channel_name,
								};
								data.msg = data.msg + cntr;
							    self.send(socket, data.msg, function(err, msg){
									console.log('msg send successfully: ' + msg);
								});
							}, 10000); 
						// }
						// var data = {
						// 	msg:  /*process.argv[3] ||*/ msgData || 'hello_there',
						// 	channel_name: channel_name,
						// };

						// chatChannel.watch(function(res) {
						// 	// console.log(res);
						// });

						// self.send(socket, data, function(err, msg){
						// 	console.log('msg send successfully: ' + data.msg);
						// });
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
		'hostname': 'localhost',
		// 'hostname':'104.154.220.2', 
		port: 8000
	}
	// var arr = [];
	// for(var i=1;i<=10;i++) {
	// 	arr.push(i);
	// }
	var cl = clientModule;
	// console.log("size = " + arr.length);
	// async.each(arr, function(item) {
			// if (cluster.isMaster) {
			// 		for(var i=0;i<10;i++) 
			//     	cluster.fork();
				  // cluster.on("exit", function(worker, code, signal) {
				  // 	// console.log('heu');
				  //   cluster.fork();
				  // });
			// } else {
					var msgData="hi there";
					cl.goForIt(options,"broadcast",msgData);
			// }	
		// }, console.log
	// )
}