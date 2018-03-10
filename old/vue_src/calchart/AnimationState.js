/**
 * An AnimationState object describes the state of a dot at a specific time
 * in the show. It contains all information required to properly draw
 * the dot in the grapher.
 */
export default class AnimationState {
    /**
     * @param {StepCoordinate} position - The position of the dot.
     * @param {number} orientation - The angle at which the dot is
     *   oriented, in Calchart degrees.
     */
    constructor(position, orientation) {
        this.x = position.x;
        this.y = position.y;
        this.angle = orientation;
    }
}
