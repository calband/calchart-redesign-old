/**
 * @fileOverview This file defines all of the custom Error classes that
 * can be thrown in the code. Usage:
 *
 * var errors = require("calchart/errors");
 *
 * AbstractClass.prototype.foo = function() {
 *     throw new errors.NotImplementedError(this);
 * };
 *
 * The built-in Error class may be used for most cases. Write a custom
 * Error class if it reduces boilerplate messages or if the Error is
 * expected to be caught within the application.
 */
var JSUtils = require("utils/JSUtils");

/**
 * An error thrown in the context of animating a show
 *
 * @param {string} message -- the message to display
 */
var AnimationStateError = function(message) {
    this.message = message;
};
JSUtils.extends(AnimationStateError, Error);

/**
 * An error for abstract methods, which subclasses need to override.
 *
 * @param {object} obj -- the instance of the subclass that did not
 *   override the abstract method
 */
var NotImplementedError = function(obj) {
    this.message = "Abstract super method was not implemented in " + obj.constructor.name;
};
JSUtils.extends(NotImplementedError, Error);

module.exports = {
    AnimationStateError: AnimationStateError,
    NotImplementedError: NotImplementedError,
};
