/**
 * @file This file defines all of the custom Error classes that can be
 * thrown in the code. The built-in Error class may be used for most
 * cases. Write a custom Error class if it reduces boilerplate messages
 * or if the Error is expected to be caught within the application.
 */

/**
 * An error regarding ApplicationController actions
 */
export class ActionError extends Error {}

/**
 * An error thrown in the context of animating a show
 */
export class AnimationStateError extends Error {}

/**
 * An error for abstract methods, which subclasses need to override.
 */
export class NotImplementedError extends Error {
    /**
     * @param {Object} obj -- the instance of the subclass that did not
     *   override the abstract method
     */
    constructor(obj) {
        let message = "Abstract super method was not implemented in " + obj.constructor.name;
        super(message);
    }
}

/**
 * An error for errors when validating data. The error message will
 * be displayed in the UI.
 */
export class ValidationError extends Error {}
