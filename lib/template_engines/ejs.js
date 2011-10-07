var ejs = require("ejs");
var fs = require("fs");
var path = require("path");

module.exports = function(template, view, callback){
	var template_buffer = "";
	fs.readFile(template, "utf8", function(err, data){
		console.log(data);
		callback(ejs.render(data, {locals:view}));
	});
	//callback(ejs.render(file.data, {locals:view}));
}