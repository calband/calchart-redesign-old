/**
 * @file Defines a Router that displays the appropriate app for the URL.
 * URLs defined here need to match urls.py so that a user going straight
 * to the URL goes to the proper place.
 */

import $ from 'jquery';
import VueRouter from 'vue-router';

import { getStore } from 'store';
import Show from 'calchart/Show';
import Home from 'home/App';
import Editor from 'editor/App';
import CreateShow from 'editor/CreateShow';
import EditShow from 'editor/EditShow';
import sendAction, { handleError } from 'utils/ajax';

/**
 * Initialize the router.
 *
 * @param {Vue} Vue
 * @return {VueRouter}
 */
export default function initRouter(Vue) {
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
                    component: CreateShow,
                },
            },
            {
                path: '/editor/:slug',
                name: 'editor',
                component: Editor,
                props: {
                    component: EditShow,
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
        // close any open popups
        $('.popup-wrapper').each(function() {
            this.__vue__.hide();
        });

        // get show for slug
        let slug = to.params.slug;
        if (slug) {
            sendAction('get_show', { slug }, {
                success: data => {
                    let store = getStore();
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

    return router;
}
