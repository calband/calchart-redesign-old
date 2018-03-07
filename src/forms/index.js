/**
 * @file The entrypoint for the forms package.
 */

import { each } from 'lodash';
import VueFormly from 'vue-formly';

import CheckboxField from './CheckboxField';
import ChoiceField from './ChoiceField';
import InputField from './InputField';
import NumberField from './NumberField';

let FIELD_TYPES = {
    checkbox: CheckboxField,
    choice: ChoiceField,
    number: NumberField,
    text: InputField,
};

let MESSAGES = {
    required: 'This field is required.',
    positive: 'This field needs to be positive.',
};

let FormsPlugin = {
    install: Vue => {
        Vue.use(VueFormly);

        each(FIELD_TYPES, (field, type) => {
            VueFormly.addType(type, field);
        });
        each(MESSAGES, (message, key) => {
            VueFormly.addValidationMessage(key, message);
        });
    },
};

export default FormsPlugin;
