#Nerd
####A framework for node.js that aims to follow Rails-like conventions.

I'm Rails developer that is getting sick of the whole Node V Rails argument,
I think that they both have their own uses. Neither is a replacement for the other.
Also Node needs a mature easy to use framework before developers like myself and many others will take notice.
 
I'm pretty much using this project as a learning exercise in node.js.
It's in very early stages.

Just has Controllers and controller/action routing.
Templating via Mustache supports layouts and views.

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
```
$ node server.js
```

Or if you have foreman installed

```
$ foreman start dev
```

