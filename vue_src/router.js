/**
 * @file Defines a Router that displays the appropriate app for the URL.
 * URLs defined here need to match urls.py so that a user going straight
 * to the URL goes to the proper place.
 */

import Vue from 'vue';
import VueRouter from 'vue-router';

import store from 'store';
import Show from 'calchart/Show';
import Editor from 'editor/App';
import Home from 'home/App';
import sendAction, { handleError } from 'utils/ajax';

Vue.use(VueRouter);

let router = new VueRouter({
    mode: 'history',
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home,
            props: {
                allTabs: window.tabs,
            },
        },
        {
            path: '/editor/:slug',
            name: 'editor',
            component: Editor,
        },
        {
            path: '/viewer/:slug',
            name: 'viewer',
            component: Home, // TODO
        },
        {
            path: '/viewpsheet/:slug',
            name: 'viewpsheet',
            component: Home, // TODO
        },
    ],
});

router.beforeEach((to, from, next) => {
    store.commit('setShow', null);

    let slug = to.params.slug;
    if (slug) {
        sendAction('get_show', { slug }, {
            success: data => {
                if (data.isInitialized) {
                    store.commit('setShow', Show.deserialize(data.show));
                    next();
                } else {
                    if (to.name === 'editor') {
                        store.commit('editor/setNewShowData', data);
                    } else {
                        alert('The show is not set up yet!');
                    }
                    next();
                }
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
