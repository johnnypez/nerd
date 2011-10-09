var $ = require("jquery");
var path = require("path");
exports = module.exports = this;
var helpers = this;

exports.tag = function(tag, options){
	var el = $("<" + tag + " />").attr(options);
	return el.get(0).outerHTML;
}

exports.content_tag = function(tag, content, options){
	var el = $("<" + tag + " />").attr(options).html(content);
	return el.get(0).outerHTML;
}

exports.image_tag = function(src, options){
	var attributes = $.extend({}, options,{
		src: path.join("/images", src)
	});
	return helpers.tag("img", attributes);
}

exports.javascript_include_tag = function(src, options){
	if(!src.match(/\.js$/)) src += ".js";
	var attributes = $.extend({}, options, {
		type: "text/javasript",
		src: path.join("/javascripts", src)
	});
	return helpers.content_tag("script", null, attributes);
}

exports.stylesheet_link_tag = function(src, options){
	if(!src.match(/\.css$/)) src += ".css";
	var attributes = $.extend({}, options, {
		rel: "stylesheet",
		href: path.join("/stylesheets", src)
	});
	return helpers.content_tag("link", null, attributes);
}