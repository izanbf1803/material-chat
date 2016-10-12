const TOAST_TYPE = [
	"error",
	"info",
	"success"
];

var Chat = angular.module("AngularChat", [])

.factory("socket", ['$rootScope', function($rootScope) {
  var socket = io.connect("192.168.1.200:8080");

  return {
	on: function(eventName, callback){
	  socket.on(eventName, callback);
	},
	emit: function(eventName, data) {
	  socket.emit(eventName, data);
	},
	connected: function() {
	  return socket.connected;
	}
  };
}])

.controller("chat", function chat($scope, socket) {
	$scope.messages = [];
	$scope.joined = false;
	$scope.alert = false;
	$scope.alertText = "";
	$scope.text = "";
	$scope.id = 0;
	$scope.nickname = "";
	$scope.show = [];

	let __nick = localStorage.getItem("nickname");
	if (__nick != null)
		$scope.nickname = __nick;

	let __c_id = localStorage.getItem("c_id");
	if (__c_id != null)
		$scope.c_id = __c_id;
	else
		socket.emit("getID");

	setInterval(function() {
		if (!socket.connected()) {
			$scope.makeAlert("Connection Lost");
		}
	}, 1000);


	$scope.keypress = function(keyEvent, action) {
		if (keyEvent.which === 13)
			eval("$scope."+action);
	};

	$scope.closeAlert = function() {
		$("#alert").closeModal();

		setTimeout(function() {
			$scope.alertText = "";
			$scope.alert = false;

			if(!$scope.$$phase)
				$scope.$apply();
		}, 1000);
	};

	$scope.makeAlert = function(txt) {
		if ($scope.alert)
			return;
		$scope.alertText = txt;
		$scope.alert = true;

		if(!$scope.$$phase)
			$scope.$apply();
		
		$("#alert").openModal();
	};

	$scope.makeToast = function(type, msg) {
		let toastContent = $("<span class=\"msg-toast msg-"+type+"\">"+msg+"</span>");
  		Materialize.toast(toastContent, 5000);
	};

	$scope.join = function() {
		socket.emit("join", $scope.nickname);
	};
	//$scope.join(); //REMOVE

	$scope.send = function() {
		if ($scope.text.length < 1)
			return;
		socket.emit("msg", $scope.text);
		$scope.text = "";
	};

	socket.on("joined", function() {
		if ($scope.joined)
			return;
		localStorage.setItem("nickname", $scope.nickname);
		$scope.joined = true;

		$scope.$apply();

		$scope.makeToast("succes", "Logged as "+$scope.nickname);
		$("#join").fadeOut();
		$("#message-input").focus();
	});

	socket.on("alert", function(msg) {
		$scope.makeAlert(msg);	
	});

	socket.on("toast", function(type, msg) {
		$scope.makeToast(TOAST_TYPE[type], msg);
	});

	socket.on("msg", function(data) {
		data.id = $scope.id;
		$scope.messages.push(data);

		$scope.$apply();

		$("#chat-message-"+String($scope.id)).fadeIn("slow");
		//$("#messages").scrollTop($("#messages").get(0).scrollHeight);
		let msg_div = $("#messages");
		msg_div.stop().animate({scrollTop:msg_div.get(0).scrollHeight}, 7500);
		$scope.id++;
		//$("body").hide();
	});

	socket.on("getID", function(data) {
		$scope.c_id = data;
		$scope.$apply();

		localStorage.setItem("c_id", $scope.c_id);
	});


	$scope.init = true;
});