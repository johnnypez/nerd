var _ = require("underscore");
var xml = require("xml");
var path = require("path");
exports = module.exports = this;
var helpers = this;

exports.tag = function(tag, options){
	var el = {};
	el[tag] = {_attr: options};
	return xml([el]);
}

exports.content_tag = function(tag, content, options){
	var el = {};
	el[tag] = [{_attr: options}, content];
	return xml([el]);
}

exports.image_tag = function(src, options){
	var attributes = _.extend({}, options,{
		src: path.join("/images", src)
	});
	return helpers.tag("img", attributes);
}

/*
	javascript_include_tag("application", "http://example.com/script.js");
*/
exports.javascript_include_tag = function(src, options){
	var args = Array.prototype.slice.call(arguments);
	var scripts = [];
	var options = null;

	while(typeof args[0] == "string") scripts.push(args.shift());
	if(typeof args[0] == "object") options = args.shift();
	
	var buffer = [];
	_.each(scripts, function(src){
		var attributes = _.extend({}, options, {
			type: "text/javascript"
		});
		if(!src.match(/\.css$/)) src += ".js";
		attributes.src = src.match(/^(https?|ftp|\/\/)/) ? src : path.join("/javascripts", src);
		buffer.push(helpers.content_tag("script", '', attributes));
	});
	return buffer.join("\n");
}

/*
	stylesheet_link_tag("style", "http://example.com/style.css", {media: "screen"});
*/
exports.stylesheet_link_tag = function(){
	var args = Array.prototype.slice.call(arguments);
	var stylesheets = [];
	var options = null;

	while(typeof args[0] == "string") stylesheets.push(args.shift());
	if(typeof args[0] == "object") options = args.shift();
	
	var buffer = [];
	_.each(stylesheets, function(src){
		var attributes = _.extend({}, options, {
			rel: "stylesheet"
		});
		if(!src.match(/\.css$/)) src += ".css";
		attributes.href = src.match(/^(https?|ftp|\/\/)/) ? src : path.join("/stylesheets", src);
		buffer.push(helpers.tag("link", attributes));
	});
	return buffer.join("\n");
}