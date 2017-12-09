<doc>
A form field that renders a text input for numbers.
</doc>

<template>
    <Field v-bind="allProps">
        <input
            v-model="model[field.key]"
            :id="field.key"
            :name="field.key"
            type="number"
        >
    </Field>
</template>

<script>
import BaseField from './BaseField';

export default {
    mixins: [BaseField],
};
</script>
