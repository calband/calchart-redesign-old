<doc>
A form field that renders a select input.

Template Options:
- {Object} choices - Choices for the select input, with the keys being the
  option value and the values being the label
- {boolean} multiple - If true, render as a multiple select
</doc>

<template>
    <Field v-bind="allProps">
        <Select2
            v-model="model[field.key]"
            :id="field.key"
            :name="field.key"
            :choices="to.choices"
            :multiple="to.multiple"
            :options="{ width: '200px' }"
        />
    </Field>
</template>

<script>
import Select2 from 'utils/Select2';

import BaseField from './BaseField';

export default {
    mixins: [BaseField],
    components: { Select2 },
};
</script>
