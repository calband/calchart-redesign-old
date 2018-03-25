/**
 * @file Defines the StepType enum.
 */

import Enum from 'utils/Enum';

export default class StepType extends Enum {
}

StepType.initEnum([
    'high-step',
    { value: 'military', label: 'Mini Military' },
    'full-field',
    'show-high',
    'jerky-step',
]);
