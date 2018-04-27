/**
 * @file Defines the DotDisplay enum.
 *
 * The enum contains all the possible ways to display a dot in a Grapher.
 */

import Enum from 'utils/Enum';

export default class DotDisplay extends Enum {
}

DotDisplay.initEnum([
    'plain',
    'orientation',
    'dot-type',
]);
