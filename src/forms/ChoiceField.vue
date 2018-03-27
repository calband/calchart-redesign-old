<doc>
A form field that renders a select input.

Template Options:
- {Object[]} choices - Choices for the select input, as a list of objects
  containing `value` and `label` properties
- {Enum} enum - Instead of providing choices, provide an Enum that contains the
  values and labels for the choices.
- {boolean} multiple - If true, render as a multiple select
</doc>

<template>
    <Field v-bind="$props">
        <Select2
            :value="model[field.key].value"
            :id="field.key"
            :name="field.key"
            :choices="choices"
            :multiple="to.multiple"
            :options="{ width: '200px' }"
            @input="handleInput"
        />
    </Field>
</template>

<script>
import { isUndefined } from 'lodash';

import Select2 from 'utils/Select2';

import Field from './Field';

export default {
    extends: Field,
    components: { Field, Select2 },
    computed: {
        choices() {
            if (this.isEnum) {
                return this.to.enum.values;
            } else {
                return this.to.choices;
            }
        },
        isEnum() {
            return !isUndefined(this.to.enum);
        },
    },
    methods: {
        handleInput(value) {
            if (this.isEnum) {
                value = this.to.enum.fromValue(value);
            }
            this.model[this.field.key] = value;
        },
    },
};
</script>
