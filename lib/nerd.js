// Node Env for Rails Developers
var connect = require("connect");
var async = require("asyncjs");
var _ = require("underscore");
var path = require("path")
var colors = require("colors");

var nerd = this;
exports.version = "0.0.10";
exports.modules = {}
exports.template_engines = require("./template_engines");
exports.root = __dirname;

exports.boot = function(callback){
	nerd.config = nerd.get_config();
	nerd.root = this.config.root;
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
		
		var server = connect.createServer();
		server.use(connect.bodyParser())
			.use(connect.cookieParser())
			.use(connect.session({ secret: nerd.config.secret}))
			.use(connect.query())
			.use(connect.favicon())
			.use(connect.static(path.join(nerd.root, 'public')));
			
		callback.apply(this, [server, connect]);
	});
};

var _config = {
	defaults:{
		root: __dirname
	}
};

exports.get_config = function(env){
	return _.extend(_config['defaults'], _config[env || process.env.NODE_ENV]);
};

exports.configure = function(env, options){
	_config[env] = _.extend({}, _config[env], options);
}

exports.default_route = {controller: undefined, action: undefined}; 

exports.router = require("./router").init(this);

exports.controller = require("./controller");