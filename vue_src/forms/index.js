/**
 * @file The entrypoint for the forms package.
 */

import { each } from 'lodash';
import VueFormly from 'vue-formly';

import CheckboxField from './CheckboxField';
import InputField from './InputField';

let FIELD_TYPES = {
    text: InputField,
    checkbox: CheckboxField,
};

let MESSAGES = {
    required: 'This field is required.',
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
