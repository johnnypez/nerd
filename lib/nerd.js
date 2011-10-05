// Node Env for Rails Developers
connect = require("connect");
var async = require("asyncjs");
var _ = require("underscore");

nerd = this;
exports.version = "0.0.3";
exports.modules = {}
exports.root = __dirname;

exports.boot = function(root, callback){
	nerd.root = root;
	async.glob(nerd.root + "/app/**/*.js").toArray(function(err, files){
	  async.forEach(files, function(file){
	 	  var name = file.name.match(/([a-z0-9_-]+)\.js$/)[1];
			var require_path = file.path.replace(/.js$/,"");
			try{
				nerd.modules[name] = require(require_path);
			}
			catch(e){
				console.log("Failed to load module: " + name + " from " + require_path);
				throw e;
			}
	 	});
		callback();
	});
};

exports.default_route = {controller: undefined, action: undefined}; 

exports.router = connect.router(
  function(app){

		app.get("/", function(req, res, next){
			route(req, res, next, nerd.default_route);
		});
	
		app.get("/:controller", function(req, res, next){
				route(req, res, next, {action: "index"});
		});

		app.get("/:controller/:action", function(req, res, next){
				route(req, res, next);
		});
	}
)

function route(req, res, next, params){
  var controller = null;
	_.extend(req.params, params);
	controller = nerd.modules[req.params.controller + "_controller"];
	if(req.params.controller == "application" || controller == undefined){
		throw Error("Controller Not Found - 404");
	}
	//console.log("controller: ", req.params.controller, controller);
	var handle = new controller.base(req, res, next);
};

exports.controller = require("./controller").Base;