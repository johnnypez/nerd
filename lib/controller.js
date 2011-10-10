var Class = require("class-js");
var _ = require("underscore");
var mime = require("mime");
var async = require("asyncjs");
var path = require("path");
var nerd;
var Controller = Class.subclass({
	init: function(request, response, next, nerd_context){
		this.params = _.extend({}, request.params, request.query, request.body);
		this.session = request.session;
		this.request = request;
		this.response = response;
		this.next = next;
		nerd = nerd_context;
		
		this.rendered = false;
		this.view = _.extend({}, this.view);
		if(this.__respond_to(this.params.action)){
			this.dispatch();
		}
		else{
			throw new Error(this.params.controller + "#" + this.params.action + " is not defined");
		}
	},
	
	dispatch: function(){
		this.before();
		this.runaction(this.params.action);
	},

	before: function(){},

	runaction: function(action_name){
		try{
			var action = eval("this." + action_name);
			action.apply(this);
		}
		catch(e){
			console.log("Action went tits up!");
			throw e;
		}
	},

	after: function(){},

	render: function(options){
		if(this.rendered === true) throw Error("Double Render! Double Meh!");
		this.after();
		this.rendered = true;	
			
		var controller = this;
		var defaults = {layout: this.layout, status: 200};
		var config = _.extend({}, defaults, options);
		
		if(config.json != undefined){
			this.render_json(options);
		}
		else if(config.text != undefined){
			this.render_text(options);
		}
		else{
			//make session and request params available to the view
			_.extend(this.view, {params: this.params, session: this.session});
			var template = path.join(this.params.controller, this.params.action + ".*");
			this.render_template(template, function(rendered, content_type){
				if(config.layout !== false){
					//add the rendered view to the yield attribute and render the layout
					_.extend(controller.view, {yield: rendered});
					var template = path.join('layouts', config.layout + ".*");
					controller.render_template(template, function(rendered, content_type){
						// render the layout with view inside
						controller.response.writeHead(config.status, {"Content-type": content_type});
						controller.response.end(rendered);
					});
				}
				else{
					// render the view
					controller.response.writeHead(config.status, {"Content-type": content_type});
					controller.response.end(rendered);
				}
			});
		}
		
	},
	
	render_template: function(template, complete){
		var controller = this;
		this.get_template_path(template, function(template_path){
			var meta = get_template_meta(template_path);
			console.log("rendering template: " + meta.name + " with engine: " + meta.engine + ", content_type: " + meta.content_type);
			if(nerd.template_engines[meta.engine] !== undefined){
				nerd.template_engines[meta.engine](template_path, controller.view, function(rendered){
					complete(rendered, meta.content_type);
				});
			}
			else{
				throw Error("Missing template engine: " + meta.engine);
			}
		});
	},
	
	render_json: function(options){
		var defaults = {content_type: "application/json", status: 200};
		var config = _.extend({}, defaults, options);
		this.response.writeHead(config.status, {"Content-type": config.content_type});
		this.response.end(JSON.stringify(config.json));
	},
	
	render_text: function(options){
		var defaults = {content_type: "text/plain", status: 200};
		var config = _.extend({}, defaults, options);
		this.response.writeHead(config.status, {"Content-type": config.content_type});
		this.response.end(config.text);
	},

	__respond_to: function(method_name){
		var method = this.__proto__[method_name];
		return (method !== undefined && typeof method == "function");
	},
	
  get_template_path: function(template, callback){
		var glob = path.join(nerd.root, 'app/views', template + '.*');
		var controller = this;	
		async.glob(glob).toArray(function(err, files){
			if(files.length < 1){
				throw Error("template not found: "+ template);
			}
			else{
				callback(files[0].path)
			}
		});
	}
});

function get_template_meta(template){
	var parts = path.basename(template).split('.');
	//expects to see templates in the form index.html.ejs, application.html.mu, name.format.engine etc
	return {
		name: parts[0],
		format: parts[1],
		engine: parts[2],
		content_type: mime.lookup(parts[1])
	}
}

module.exports = exports = Controller;