#! /usr/bin/env node

// stuff borrowed here from express
var nerd = require("../index"),
exec = require('child_process').exec,
program = require('commander'),
mkdirp = require('mkdirp'),
fs = require('fs'),
_ = require("underscore");

program
  .version(nerd.version)
	.option('-a --app <name>', 'create new application')
	.option('-c --controller <name>', 'create new controller(s)')
  .parse(process.argv);

var path = program.app || '.';

program.css = null;
program.template = "parrot"

var procfile = [
	"web: node server.js",
	"dev: export PORT=4400 && export NODE_ENV=development && node server.js"
].join("\n");

var server = [
'var nerd = require("nerd");',
'nerd.configure(\'defaults\',{',
'	root: __dirname,',
'	secret: \'_session_secret\'',
'});',
'nerd.configure(\'development\',{});',
'nerd.configure(\'production\',{});',
'nerd.boot(function(server, connect){',
'	var port = process.env.PORT || 3000',
'	nerd.default_route = {controller: "home", action: "index"};',
'	server.use(nerd.router(function(map){',
'		map.root({controller:"home", action:"index"});',
'		map.match("/:controller/:action");',
'	}));',
'	server.listen(port, function(){',
'		console.log(process.env.NODE_ENV + " server up on port: " + port, "\nconfig: ", nerd.config);',
'	});',
'});',
].join("\n");

var app_controller = [
'var nerd = require(\'nerd\');',
'module.exports = exports = nerd.controller.subclass({',
'	layout: "application"',
'});',
].join("\n");

var default_controller = [
'var application_controller = require("./application_controller");',
'module.exports = exports = application_controller.subclass({',
'	index:function(){',
'		this.view.foo = "bar";',
'		this.render();',
'	}	',
'});',
].join("\n");

var app_layout = [
'<!DOCTYPE html>',
'<html>',
'  <head>',
'    <title>Nerd</title>',
'		 <%= stylesheet_link_tag(\'style\') %>',
'  </head>',
'  <body>',
'    <h1>Nerd</h1>',
'    <%= yield %>',
'  </body>',
'</html>',
].join("\n");

var default_controller_index = "<h2><%= foo %></h2>";


var css = [
    'body {'
  , '  padding: 50px;'
  , '  font: 14px "Lucida Grande", Helvetica, Arial, sans-serif;'
  , '}'
  , ''
  , 'a {'
  , '  color: #00B7FF;'
  , '}'
].join('\n');

/**
 * Default less template.
 */

var less = [
    'body {'
  , '  padding: 50px;'
  , '  font: 14px "Lucida Grande", Helvetica, Arial, sans-serif;'
  , '}'
  , ''
  , 'a {'
  , '  color: #00B7FF;'
  , '}'
].join('\n');

/**
 * Default sass template.
 */

var sass = [
    'body'
  , '  :padding 50px'
  , '  :font 14px "Lucida Grande", Helvetica, Arial, sans-serif'
  , 'a'
  , '  :color #00B7FF'
].join('\n');

/**
 * Default stylus template.
 */

var stylus = [
    'body'
  , '  padding: 50px'
  , '  font: 14px "Lucida Grande", Helvetica, Arial, sans-serif'
  , 'a'
  , '  color: #00B7FF'
].join('\n');


// Generate application
if(program.app){
	(function createApplication(path) {
	  emptyDirectory(path, function(empty){
	    if (empty) {
	      createApplicationAt(path);
	    } else {
	      program.confirm('destination is not empty, continue? ', function(ok){
	        if (ok) {
	          process.stdin.destroy();
	          createApplicationAt(path);
	        } else {
	          abort('aborting');
	        }
	      });
	    }
	  });
	})(path);
}

if(program.controller){
	(function createController(controllers){
		_.each(controllers, function(controller){
			mkdir(path + '/app/views/' + controller, function(){
				write(path + '/app/views/' + controller + "/index.html.js", default_controller_index);
			});
			
			mkdir(path + '/app/controllers' , function(){
				write(path + '/app/controllers/' + controller + '_controller.js', default_controller);
			});
		});
	})(program.controller.split(","))
}

/**
 * Create application at the given directory `path`.
 *
 * @param {String} path
 */

function createApplicationAt(path) {
  mkdir(path, function(){
    mkdir(path + '/public/javascripts');
    mkdir(path + '/public/images');
    mkdir(path + '/public/stylesheets', function(){
      switch (program.css) {
        case 'stylus':
          write(path + '/public/stylesheets/style.styl', stylus);
          break;
        case 'less':
          write(path + '/public/stylesheets/style.less', less);
          break;
        case 'sass':
          write(path + '/public/stylesheets/style.sass', sass);
          break;
        default:
          write(path + '/public/stylesheets/style.css', css);
      }
    });
		
		mkdir(path + '/app/controllers', function(){
			write(path + '/app/controllers/application_controller.js', app_controller);
		});
		
		mkdir(path + '/app/models');
		
    mkdir(path + '/app/views/layouts', function(){
      switch (program.template) {
        case 'parrot':
          write(path + '/app/views/layouts/application.html.js', app_layout);
          break;
      }
    });


    // package.json
    var json = '{\n';
    json += '    "name": "'+program.app+'"\n';
    json += '  , "version": "0.0.1"\n';
    json += '  , "private": true\n';
    json += '  , "dependencies": {\n';
    json += '      "nerd": "' + nerd.version + '"\n';
    if (program.css) json += '    , "' + program.css + '": ">= 0.0.1"\n';
    json += '  }\n';
    json += '}';

		write(path + '/Procfile', procfile);
    write(path + '/package.json', json);
    write(path + '/server.js', server);
		write(path + '/.gitignore', "node_modules");
  });
}

/**
 * Check if the given directory `path` is empty.
 *
 * @param {String} path
 * @param {Function} fn
 */

function emptyDirectory(path, fn) {
  fs.readdir(path, function(err, files){
    if (err && 'ENOENT' != err.code) throw err;
    fn(!files || !files.length);
  });
}

/**
 * echo str > path.
 *
 * @param {String} path
 * @param {String} str
 */

function write(path, str) {
  fs.writeFile(path, str);
  console.log('   \x1b[36mcreate\x1b[0m : ' + path);
}

/**
 * Mkdir -p.
 *
 * @param {String} path
 * @param {Function} fn
 */

function mkdir(path, fn) {
  mkdirp(path, 0755, function(err){
    if (err) throw err;
    console.log('   \033[36mcreate\033[0m : ' + path);
    fn && fn();
  });
}

/**
 * Exit with the given `str`.
 *
 * @param {String} str
 */

function abort(str) {
  console.error(str);
  process.exit(1);
}

