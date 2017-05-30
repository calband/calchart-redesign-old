/**
 * @file A collection of environment-dependent settings.
 */

/**
 * true if working on the development site.
 * @const {boolean}
 */
export const IS_LOCAL = location.hostname === "localhost";

/**
 * true if the user is on a Mac, false otherwise.
 * https://css-tricks.com/snippets/javascript/test-mac-pc-javascript/
 * @const {boolean}
 */
export const IS_MAC = navigator.userAgent.includes("Mac OS X");
