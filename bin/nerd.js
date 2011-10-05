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
	.options('-a --app', 'create new application')
	.options('-c --controller', 'create new controller')
  .parse(process.argv);

var path = program.args.shift() || '.';

program.template = "mustache";
program.css = null;

var procfile = ["web: node server.js","dev: node server.js NODE_ENV=development"].join("\n");

var server = [
	'require("nerd");',
	'nerd.boot(__dirname, function(){',
	'  var server = connect(connect.bodyParser(), connect.cookieParser(), connect.query(), connect.favicon());',
	'  var port = process.env.NODE_ENV == \'development\' ? 3000 : 80;',
	'//nerd.default_route = {controller: "home", action: "index"};',
	'  server.use(nerd.router);',
	'  server.listen(port);',
	'});',
].join("\n");

var app_controller = [
'require(\'nerd\');',
'exports.base = nerd.controller.extend({',
'	layout: "application"',
'});',
].join("\n");

var default_controller = [
'var application_controller = require("./application_controller");',
'exports.base = application_controller.base.extend({',
'	index:function(){',
'		this.locals.foo = "bar";',
'		this.render();',
'	}	',
'});',
].join("\n");

var app_layout = [
'<!DOCTYPE html>',
'<html>',
'  <head>',
'    <title>Nerd</title>',
'		 <link rel="stylesheet" href="stylesheets/style.css" />',
'  </head>',
'  <body>',
'    {{{yield}}}',
'  </body>',
'</html>',
].join("\n");

var default_controller_index = "<h2>{{foo}}</h2>";


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
	_.each(program.controller.split(","), function(controller){
		mkdir(path + '/app/views/' + controller);
		write(path + '/app/views/' + controller + "index.html.mu", default_controller_index);
		write(path + '/app/views/controllers/' + controller + '_controller.js', default_controller);
	});
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
		
		mkdir(path + '/app/controllers');
		write(path + '/app/views/controllers/appliction_controller.js', app_controller);
		
		mkdir(path + '/app/models');
		
    mkdir(path + '/app/views/layouts', function(){
      switch (program.template) {
        case 'mustache':
          write(path + '/app/views/layouts/application.html.mu', app_layout);
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
    write(path + '/server.js', app);
		write(path + '/.gitignore', "npm_modules");
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

