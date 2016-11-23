Icomoon
=======

We are using the icomoon font (http://icomoon.io) for all of the vector icons we use on the site. Open icomoon-reference.html in a browser to see the different icons, and their codes, available. To use an icon, do something similar to the following:

p:before {
    content: "\e901"; // the icon code
    font-family: "icomoon";
}

To add icons to the set, import the selection.json file to icomoon.io (Menu > Import To Set) and re-export the files. Be sure to update icomoon-reference.{css,html} manually also, for our own reference.
