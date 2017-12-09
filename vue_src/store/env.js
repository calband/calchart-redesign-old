/**
 * @file Defines the Vuex module containing state relating to the environment.
 */

export default {
    namespaced: true,
    state: {
        // The CSRF token for POST requests
        csrfToken: window.env.csrf_token,
        // true if working on the development site
        isLocal: window.env.is_local,
        // true if the user is on a Mac
        // https://css-tricks.com/snippets/javascript/test-mac-pc-javascript/
        isMac: navigator.userAgent.includes('Mac OS X'),
        // true if the current user is on Stunt
        isStunt: window.env.is_stunt,
        // the path to static files, without a trailing slash
        staticPath: window.env.static_path,
    },
};
