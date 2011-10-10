var connect = require("connect");
var _ = require("underscore");
require("inflector");
var app, nerd;
exports = module.exports = this;

exports.init = function(nerd_context){
	nerd = nerd_context;
	return router;
}

var router = function(setup){
	return connect.router(function(application){
		app = application;
		setup(mapper);
	});
}

var mapper = {
	root: function(params, options){
		make_route("/", params, options);
	},

	match: function(route, params, options){
		make_route(route, params, options);
	},

	resource: function(name, options){
		
	},

	resources: function(name, options){
		var defaults = {via: 'get'};
		var config = _.extend({}, defaults, options);
		make_route("/" + name.plural(), {controller: name.plural(), action: "index"});
		make_route("/" + name.plural() + "/new", {controller: name.plural(), action: "new"});
		make_route("/" + name.plural(), {controller: name.plural(), action: "create"}, {via: 'post'});
		make_route("/" + name.plural() + "/:id/edit", {controller: name.plural(), action: "edit"});
		make_route("/" + name.plural() + "/:id", {controller: name.plural(), action: "show"});
		make_route("/" + name.plural() + "/:id", {controller: name.plural(), action: "update"}, {via: "put"});
		make_route("/" + name.plural() + "/:id", {controller: name.plural(), action: "destroy"}, {via: "delete"});
	}
}

function make_route(route_path, params, options){
	var defaults = {via: 'get'};
	var config = _.extend({}, defaults, options);
	console.log("adding route: ", route_path, params, options);
	app[config.via](route_path, function(req, res, next){
		route(req, res, next, params);
	});
}

function route(req, res, next, params){
  var controller = null;
	var defaults = {format: "html"};
	_.extend(defaults, req.params, params);
	controller = nerd.modules[req.params.controller + "_controller"];
	if(req.params.controller == "application" || controller == undefined){
		res.writeHead(404);
		res.end();
		console.log(req.url.red);
	}
	else{
		console.log(req.url.yellow);
		if(process.env.NODE_ENV == 'development') console.log("params: ", req.params, "session: ", req.session);
		var handle = controller.init(req, res, next, nerd);
	}
};