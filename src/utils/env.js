/**
 * @file A collection of environment-dependent settings.
 */

/**
 * @const {string} The CSRF token for POST requests.
 */
export const CSRF_TOKEN = window.env.csrf_token;

/**
 * @const {boolean} true if working on the development site.
 */
export const IS_LOCAL = window.env.is_local;

/**
 * true if the user is on a Mac, false otherwise.
 * https://css-tricks.com/snippets/javascript/test-mac-pc-javascript/
 * @const {boolean}
 */
export const IS_MAC = navigator.userAgent.includes("Mac OS X");

/**
 * @const {boolean} true if the current user is on Stunt
 */
export const IS_STUNT = window.env.is_stunt;

/**
 * @const {string} The path to staticfiles, without a trailing slash.
 */
export const STATIC_PATH = window.env.static_path;
