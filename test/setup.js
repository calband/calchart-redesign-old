/**** NODE GLOBALS ****/

global.expect = require('expect');

/**** BROWSER GLOBALS ****/

require('jsdom-global')();

window.jQuery = {};
window.env = {};
