var Class = require("class-js");
var _ = require("underscore");
var async = require("asyncjs");
var Mu = require("mu");
var path = require("path");
var nerd;
var Controller = Class.subclass({
	init: function(request, response, next, nerd_context){
		this.params = _.extend({}, request.params, request.query, request.body);
		this.request = request;
		this.response = response;
		this.next = next;
		nerd = nerd_context;
		
		console.log(this.request.url, this.params);
		
		this.rendered = false;
		this.locals = _.extend({}, this.locals);
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
		var defaults = {layout: this.layout, content_type: "text/html", status: 200};
		var config = _.extend({}, defaults, options);
		
		if(config.json != undefined){
			this.render_json(options);
		}
		else if(config.text != undefined){
			this.render_text(options);
		}
		else{
			this.response.writeHead(config.status, {"Content-type": config.content_type});
			this.render_template(function(yield){
				var out = yield;
				if(config.layout !== false){
					_.extend(controller.locals, {yield: yield});
					controller.render_layout(config.layout, function(rendered){
						controller.response.end(rendered);
					});
				}
				else{
					controller.response.end(out);
				}
			});
		}
		
	},
	
	render_layout: function(layout_name, complete){
		console.log("render layout: " + layout_name);
		var layout_path = path.join(nerd.root, 'app/views/layouts');
		var layout_glob = path.join(layout_path, layout_name + ".*");
		var layout = "";
		var buffer = "";
		var controller = this;
		
		async.glob(layout_glob).toArray(function(err, files){
			if(files.length < 1){
				throw Error("Missing Layout: "+ template);
			}
			else{
				layout = files[0].name
				Mu.root = layout_path;
				//console.log("Rendering View: ", Mu.root, layout, controller.locals);
				
				Mu.compile(layout, function (err, compiled_template) {
			    if (err) throw err;

					Mu.render(compiled_template, controller.locals)
					.on('data', function (c) { buffer += c;})
					.on('end', function () { complete(buffer); });
					
				});
			}
		});
	},
	
	render_template: function(complete){
		var template_path = path.join(nerd.root, 'app/views/', this.params.controller);
		var template_glob = path.join(template_path, this.params.action + ".*");
		var template = "";
		var buffer = "";
		var controller = this;
		
		async.glob(template_glob).toArray(function(err, files){
			if(files.length < 1){
				throw Error("Missing Template for "+ _t.params.controller + "#" + _t.params.action);
			}
			else{
				template = files[0].name
				Mu.root = template_path;
				//console.log("Rendering View: ", Mu.root, template, controller.locals);
				
				Mu.compile(template, function (err, compiled_template) {
			    if (err) throw err;
					Mu.render(compiled_template, controller.locals)
					.on('data', function (c) { buffer += c;})
					.on('end', function () { complete(buffer); });
					
				});
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
	}
});

module.exports = exports = Controller;