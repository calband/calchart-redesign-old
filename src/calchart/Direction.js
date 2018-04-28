import Enum from 'utils/Enum';

/**
 * An Enum containing all directions, including compound directions.
 */
export class CompoundDirection extends Enum {
    /**
     * Convert the given angle into a CompoundDirection, where an exact multiple
     * of 90 degrees converts to a whole direction and everything else converts
     * to a compound direction.
     *
     * e.g.
     *     CompoundDirection.fromAngle(90) === CompoundDirection.SOUTH
     *     CompoundDirection.fromAngle(89) === CompoundDirection.SOUTHEAST
     *
     * @param {Number} angle - The angle, in Calchart degrees
     * @return {CompoundDirection}
     */
    static fromAngle(angle) {
        if (angle === 0) {
            return CompoundDirection.EAST;
        } else if (angle < 90) {
            return CompoundDirection.SOUTHEAST;
        } else if (angle === 90) {
            return CompoundDirection.SOUTH;
        } else if (angle < 180) {
            return CompoundDirection.SOUTHWEST;
        } else if (angle === 180) {
            return CompoundDirection.WEST;
        } else if (angle < 270) {
            return CompoundDirection.NORTHWEST;
        } else if (angle === 270) {
            return CompoundDirection.NORTH;
        } else {
            return CompoundDirection.NORTHEAST;
        }
    }
}

CompoundDirection.initEnum([
    { value: 'east', label: 'E' },
    { value: 'southeast', label: 'SE' },
    { value: 'south', label: 'S' },
    { value: 'southwest', label: 'SW' },
    { value: 'west', label: 'W' },
    { value: 'northwest', label: 'NW' },
    { value: 'north', label: 'N' },
    { value: 'northeast', label: 'NE' },
]);

/**
 * An Enum containing just the cardinal directions.
 */
export class CardinalDirection extends Enum {
    /**
     * Round the given angle to the nearest cardinal direction.
     *
     * @param {Number} angle - The angle, in Calchart degrees
     * @return {CardinalDirection}
     */
    static fromAngle(angle) {
        if (angle <= 45 || angle >= 315) {
            return CardinalDirection.EAST;
        } else if (angle < 315) {
            return CardinalDirection.SOUTH;
        } else if (angle <= 225) {
            return CardinalDirection.WEST;
        } else {
            return CardinalDirection.NORTH;
        }
    }
}

CardinalDirection.initEnum([
    { value: 'east', label: 'E', angle: 0 },
    { value: 'south', label: 'S', angle: 90 },
    { value: 'west', label: 'W', angle: 180 },
    { value: 'north', label: 'N', angle: 270 },
]);
