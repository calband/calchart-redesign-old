import makeEnum from 'utils/enum';

const STEP_TYPES = [
    'high-step',
    { value: 'military', label: 'Mini Military' },
    'full-field',
    'show-high',
    'jerky-step',
];

/**
 * An Enum containing all the possible marching steps.
 */
export class BaseStepType {
}

makeEnum(BaseStepType, STEP_TYPES);

/**
 * An Enum containing all the possible marching steps, plus default.
 */
export default class StepType {
}

makeEnum(StepType, ['default', ...STEP_TYPES]);
