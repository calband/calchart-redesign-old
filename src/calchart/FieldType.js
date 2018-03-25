/**
 * @file Defines the FieldType enum.
 */

import Enum from 'utils/Enum';

export default class FieldType extends Enum {
}

FieldType.initEnum([
    { value: 'college', label: 'College Field', dimensions: [160, 84] },
]);
