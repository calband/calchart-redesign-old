/**
 * @fileOverview Defines miscellaneous utility functions.
 */

/**
 * A collection of javascript utility functions.
 */
var JSUtils = {};
 
/**
 * Causes a child class to inherit from a parent class.
 *
 * @param {function} ChildClass The class that will inherit
 *   from another.
 * @param {function} ParentClass The class to inherit from.
 */
JSUtils.extends = function(ChildClass, ParentClass) {
    var Inheritor = function() {}; // dummy constructor
    Inheritor.prototype = ParentClass.prototype;
    ChildClass.prototype = new Inheritor();
};

module.exports = JSUtils;
