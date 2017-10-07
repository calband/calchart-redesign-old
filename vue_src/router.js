/**
 * @file Defines a Router that displays the appropriate app for the URL.
 * URLs defined here need to match urls.py so that a user going straight
 * to the URL goes to the proper place.
 */

import Vue from "vue";
import VueRouter from "vue-router";

import Home from "home/App";

Vue.use(VueRouter);

export default new VueRouter({
    mode: "history",
    routes: [
        {
            path: "/",
            name: "home",
            component: Home,
        },
        {
            path: "/editor/:slug/",
            name: "editor",
            component: Home, // TODO
        },
        {
            path: "/viewer/:slug/",
            name: "viewer",
            component: Home, // TODO
        },
        {
            path: "/viewpsheet/:slug/",
            name: "viewpsheet",
            component: Home, // TODO
        },
    ],
});
