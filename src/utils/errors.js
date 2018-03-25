/**
 * @file Defines all of the custom Error classes that can be thrown.
 *
 * The built-in Error class may be used for most cases. Write a custom Error
 * class if it reduces boilerplate messages or if the Error is expected to be
 * caught within the application.
 */

/**
 * An error regarding ApplicationController actions.
 */
export class ActionError extends Error {}

/**
 * An error thrown in the context of animating a show.
 */
export class AnimationStateError extends Error {}
