<doc>
A component that renders a Select2 element.
</doc>

<template>
    <select
        :value="value"
        @input="$emit('input', $event.target.value)"
    >
        <option
            v-for="choice in choices"
            :key="choice.value"
            :value="choice.value"
        >{{ choice.label }}</option>
    </select>
</template>

<script>
import $ from 'jquery';
import { defaults } from 'lodash';
import 'select2/dist/js/select2.min.js';
import 'select2/dist/css/select2.min.css';

import { validateList, validateObject } from 'utils/validators';

export default {
    props: {
        value: {
            // The v-model attribute.
            type: null,
            required: true,
        },
        choices: {
            // The choices in the <select> element, as a list of objects
            // containing `value` and `label` properties
            type: Array,
            required: true,
            validator: validateList(validateObject('value', 'label')),
        },
        multiple: {
            // true if this should be a multiple select
            type: Boolean,
            default: false,
        },
        options: {
            // Any additional options to pass to Select2
            type: Object,
            default: () => ({}),
        },
    },
    mounted() {
        let vm = this;
        let options = defaults({}, this.options, {
            minimumResultsForSearch: 10,
            multiple: this.multiple,
        });

        $(this.$el)
            .select2(options)
            .change(function() {
                vm.$emit('input', $(this).val());
            });
    },
    destroyed() {
        $(this.$el).off().select2('destroy');
    },
};
</script>
