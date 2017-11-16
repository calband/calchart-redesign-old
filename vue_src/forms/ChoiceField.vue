<doc>
A form field that renders a select input.

Template Options:
- {Object} choices - Choices for the select input, with the keys being the
  option value and the values being the label
- {boolean} multiple - If true, render as a multiple select
</doc>

<template>
    <Field v-bind="allProps">
        <select
            v-model="model[field.key]"
            :id="field.key"
            :name="field.key"
        >
            <option
                v-for="(label, value) in to.choices"
                :key="value"
                :value="value"
            >{{ label }}</option>
        </select>
    </Field>
</template>

<script>
import $ from 'jquery';
import _ from 'lodash';
import 'select2/dist/js/select2.min.js';
import 'select2/dist/css/select2.min.css';

import BaseField from './BaseField';

export default {
    mixins: [BaseField],
    mounted() {
        let vm = this;
        $(this.$el).find("select")
            .select2({
                width: '200px',
                minimumResultsForSearch: 10,
                multiple: _.defaultTo(this.to.multiple, false),
            })
            .change(function() {
                vm.model[vm.field.key] = $(this).val();
            });
    },
    destroyed() {
        $(this.$el).off().select2('destroy');
    },
};
</script>
