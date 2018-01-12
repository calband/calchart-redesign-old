import makeEnum from 'utils/enum';

const ORIENTATIONS = [
    { value: 'east', angle: 0 },
    { value: 'west', angle: 180 },
];

/**
 * An Enum containing all the possible orientations.
 */
export class BaseOrientation {
}

makeEnum(BaseOrientation, ORIENTATIONS);

/**
 * An Enum containing all the possible orientations, plus default.
 */
export default class Orientation {
}

makeEnum(Orientation, ['default', ...ORIENTATIONS]);
