/**
 * @file Defines a Router that displays the appropriate app for the URL.
 * URLs defined here need to match urls.py so that a user going straight
 * to the URL goes to the proper place.
 */

import $ from 'jquery';
import Vue from 'vue';
import VueRouter from 'vue-router';

import store from 'store';
import Show from 'calchart/Show';
import Home from 'home/App';
import Editor from 'editor/App';
import sendAction, { handleError } from 'utils/ajax';

Vue.use(VueRouter);

let router = new VueRouter({
    mode: 'history',
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home,
        },
        {
            path: '/create-show',
            name: 'create-show',
            component: Editor,
            props: {
                create: true,
            },
        },
        {
            path: '/editor/:slug',
            name: 'editor',
            component: Editor,
            props: {
                create: false,
            },
        },
        // {
        //     path: '/viewer/:slug',
        //     name: 'viewer',
        //     component: Home,
        // },
        // {
        //     path: '/viewpsheet/:slug',
        //     name: 'viewpsheet',
        //     component: Home,
        // },
    ],
});

router.beforeEach((to, from, next) => {
    let slug = to.params.slug;
    if (slug) {
        sendAction('get_show', { slug }, {
            success: data => {
                store.commit('setShow', Show.deserialize(data));
                next();
            },
            error: xhr => {
                handleError(xhr);
                next('/');
            },
        });
    } else {
        next();
    }
});

export default router;
