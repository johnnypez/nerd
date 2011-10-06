var nerd = require("../index");
console.log("nerd", nerd);

var test_controller = nerd.controller.subclass({
	index: function(){
		console.log("INDEX");
	}
});

var req = {params:{controller:"test", action:"index"}},
res = {},
next = function(){};

var handle = test_controller.init(req, res, next);