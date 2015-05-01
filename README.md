Acclamation
===========

Acclamation is a web application designed to make retrospectives easier.  Retros
can be incredibly useful; but with large teams, retros can become tedious and
inefficient.  Instead of writing sticky notes and cramming around a white board,
Acclamation allows teams to substitute technology for tedium.

[![Analytics](https://ga-beacon.appspot.com/UA-43004538-2/matthewpatterson/acclamation)](https://github.com/igrigorik/ga-beacon)

Requirements
------------

* Node.js >= v0.10
* NPM
* Redis

Installation
------------

    npm install
    bower install

Starting the Server
-------------------

Compile static assets:

    # minified version
    grunt assets:install

    # or non-minified version
    grunt assets:install_dev

Run the server:

    npm start

A Procfile is provided for development:

    foreman start -p 8000

This runs the application inside of `supervisor`, watching for changes to any
non-vendored ".js" files.  It also runs `grunt assets:watch` to recompile
JavaScript and CSS assets when they change.  Just point your browser to
`http://localhost:8000` and retrospect!

    foreman start -p 8000 -c all=1,web=4

This command runs four node proceeses on ports 8100-8103, with nginx load
balancing requests on port 8000.  This configuration is useful for larger groups.
The nginx configuration provided will load balance across four node upstreams,
but could be easily tweaked to add more.  With this command, you'll want to point
your browser to `http://localhost:8000`.

You can also pre-populate Redis with data using:

    grunt db:do_over

Since data in Redis is not persisted to disk, you will need to run this command
while the application is running.

Contributors
------------

* [Matthew Patterson](https://github.com/matthewpatterson)
* [Kevin Boschert](https://github.com/kcboschert)
* [Drew Olson](https://github.com/drewolson)
