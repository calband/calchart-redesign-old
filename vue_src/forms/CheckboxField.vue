<doc>
A form field that renders a checkbox.
</doc>

<template>
    <Field v-bind="allProps">
        <input
            v-model="model[field.key]"
            :id="field.key"
            :name="field.key"
            type="checkbox"
        >
    </Field>
</template>

<script>
import BaseField from './BaseField';

export default {
    mixins: [BaseField],
};
</script>
