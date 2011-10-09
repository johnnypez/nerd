var parrot = require("parrot");
var fs = require("fs");
var path = require("path");
var _ = require("underscore");
var helpers = require("../helpers")

module.exports = function(template, view, callback){
	_.extend(view, helpers);
	fs.readFile(template, "utf8", function(err, data){
		callback(parrot.render(data, {sandbox:view}));
	});
}