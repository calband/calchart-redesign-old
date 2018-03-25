/**
 * @file Defines the Orientation enum.
 */

import Enum from 'utils/Enum';

export default class Orientation extends Enum {
}

Orientation.initEnum([
    { value: 'east', angle: 0 },
    { value: 'west', angle: 180 },
]);
