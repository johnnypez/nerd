var mu = require("mu");
var path = require("path");

module.exports = function(template, view, callback){
	var buffer = "";
	console.log("mustache render: ", template);
	mu.root = path.dirname(template);
	mu.compile(path.basename(template), function (err, compiled) {
    if (err) throw err;
		mu.render(compiled, view)
		.on('data', function (c) { buffer += c;})
		.on('end', function () { callback(buffer); });
	});
}
