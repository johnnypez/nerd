#Nerd
####A node.js framework for Rails people

This started out as a learning exercise in Node.js. I was getting pretty sick of the whole Rails v Node argument.
I always think that argument is like comparing apples and oranges. Rails developers love the power of the framework and
the productivity boost you get from using it. So far I haven't seen an equivalent for Node. As there are some advantages
to using Node depending on your project, I wanted to see what I could do to lower the barrier to entry.

So I have started to build out this framework to provide a familiar environment for rails developers. The app structure is pretty much the same.
The controllers are structured in a similar way.

I'm providing some of the global helpers you're familiar with in your views like stylesheet_link_tag, javascript_include_tag, image_tag, tag and content_tag.
The global helpers need to be expanded on. The tricky ones are ones like form_tag where in rails you would pass a block. In javascript this gets messy. I'm open to suggestions.
I'll get around to adding helpers for each controller too.

Templating is flexible and pluggable.
The default templating engine is Parrot which is quite like ejs.
https://github.com/ollym/parrot

I have rolled in support for ejs and mustache. You only need to change your template extensions to .html.ejs or .html.mu
You can mix it up if you like.

Layouts are supported. Just place the yield variable wherever you want your view content to be placed. I've supported this in parrot, ejs and mu.

Routing is simple controller/action based for the moment. I'll be coming back to that.

I have no structure for models in place yet either. I'm thinking about Backbone but haven't had time to evaluate properly.

As of Oct 10th 2011 / A weeks worth of evenings have gone into this. I'm still getting to grips with Node. If you see any issues, gotchas, or potential please shout!

##Create an app

```
$ nerd -a test_app
```

```
$ cd test_app
```

Create a controller or two

```
$ nerd -c home,profile
```

Edit server.js to set your default_route
then start your server

```
$ NODE_ENV=development node server.js
```

Or if you have foreman installed

```
$ foreman start dev
```

###Rendering from a Controller

You must always eventually call ```this.render()``` in your controller actions.

Calling ```this.render()``` alone will render the view inside the current layout, passing the ```this.view``` object
as the context for the template engine.

You can also render json:

```
var foo = {key: "value"}
this.render({json: foo});
```

and you can render plain text:

```
var str = "lorem ipsum dolor";
this.render({text: str});
```

####Other supported arguments:

```
this.render({content_type: "text/html", status: 404});
```

