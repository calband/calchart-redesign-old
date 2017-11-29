import makeEnum from 'utils/enum';

/**
 * An Enum containing all the possible editing tools.
 */
export default class ToolType {
}

makeEnum(ToolType, [
    'selection',
    'lasso',
    'swap',
    'stretch',
    'line',
    'arc',
    'block',
    'circle',
]);
