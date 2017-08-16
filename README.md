CalChart
========

An attempt at a web-based redesign of Calchart, which integrates the desktop Calchart application, the viewer, and the server.

Goals:
- Create a cloud file system that stores shows created by Stunt and can be viewed by bandsmen
- Create an intuitive UI for charting shows
- Integrate Calchart Viewer
- Integrate the individual continuity generator

Setup:
------

1. Install Virtualbox and Vagrant
1. Clone the repo
1. `vagrant up`: This will setup a VM that will be installed with all dependencies needed for this project
1. `python vgrunt.py build`: This will build all of the SASS and Javascript files and watch for changes to rebuild
1. Run `python vmanage.py runserver`
1. Go to `http://localhost:5000`. The development login is member/calbandgreat.

Development
-----------

This project is written in Javascript (ECMAScript 6) using Grunt/Webpack to compile the Javascript files. This is slightly different from the usual Javascript you might be using in other projects. For a quick introduction to the new language, see `docs/Style.md`.
