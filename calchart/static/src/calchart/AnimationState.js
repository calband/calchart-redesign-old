/**
 * An AnimationState object describes the state of a dot at a specific time
 * in the show. It contains all information required to properly draw
 * the dot in the grapher.
 *
 * @param {Coordinate} position -- the position of the dot
 * @param {float} orientation -- the angle at which the dot is oriented, in
 *   Calchart degrees
 */
var AnimationState = function(position, orientation) {
    this.x = position.x;
    this.y = position.y;
    this.angle = orientation;
};

module.exports = AnimationState;
