import makeEnum from 'utils/enum';

const FIELD_TYPES = [
    { value: 'college', label: 'College Field', dimensions: [160, 84] },
];

/**
 * An Enum containing all the possible field types.
 */
export class BaseFieldType {
}

makeEnum(BaseFieldType, FIELD_TYPES);

/**
 * An Enum containing all the possible field types, plus default.
 */
export default class FieldType {
}

makeEnum(FieldType, ['default', ...FIELD_TYPES]);
