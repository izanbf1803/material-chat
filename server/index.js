var express = require("express"),
server = require("http").Server(express()),
io = require("socket.io")(server),
utils = require("./utils.js")
;

var TOAST_TYPE = {
	"error": 0,
	"info" : 1,
	"success": 2
};
var clients = {};
var nicks = {};

io.on("connection", function(socket) {

	socket.on("disconnect", function() {
		var nick = clients[socket.id];

		delete clients[socket.id];
		delete nicks[nick];

		if (nick == undefined)
			return;

		for (id in clients) {
			io.to(id).emit("msg", {
				style: "notification-alert",
				user: nick,	// Notify user disconnection
				message: "disconnected"
			});
		}
	});

	socket.on("join", function(nick) {
		if (clients[socket.id] == undefined && nicks[nick] == undefined) {
			var checkName = utils.checkValidNick(nick);
			if (checkName === true) {
				clients[socket.id] = nick;
				nicks[nick] = socket.id;

				socket.emit("joined");

				for (id in clients) {
					io.to(id).emit("msg", {
						style: "notification-succes",
						user: nick,	// Notify user connection
						message: "connected"
					});
				}

			} else {
				socket.emit("alert", checkName);
			}
		} else {
			socket.emit("toast", TOAST_TYPE["error"], "\""+nick+"\" is used by other user!");
		}
	});

	socket.on("msg", function(data) {
		filter = utils.checkBadWords(data);
		if (filter === true) {
			for (id in clients) {
				io.to(id).emit("msg", {
					style: "",
					user: clients[socket.id],
					message: data
				});
			}
		} else {
			io.to(socket.id).emit("alert", filter);
		}
	});

	socket.on("getID", function(data, callback) {
		socket.emit("getID", utils.randID());
	});

});

server.listen(8080);