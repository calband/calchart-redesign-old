<doc>
A component that renders a Select2 element.
</doc>

<template>
    <select
        @input="$emit('input', $event.target.value)"
        :value="value"
    >
        <option
            v-for="(label, value) in choices"
            :key="value"
            :value="value"
        >{{ label }}</option>
    </select>
</template>

<script>
import $ from 'jquery';
import { defaults } from 'lodash';
import 'select2/dist/js/select2.min.js';
import 'select2/dist/css/select2.min.css';

export default {
    props: {
        value: {
            // The v-model attribute.
            required: true,
        },
        choices: {
            // The choices in the <select> element, where the keys are the
            // option values and the values are the label.
            type: Object,
            required: true,
        },
        multiple: {
            // true if this should be a multiple select
            type: Boolean,
            default: false,
        },
        options: {
            // Any additional options to pass to Select2
            type: Object,
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
