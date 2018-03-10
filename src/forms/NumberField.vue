<doc>
A form field that renders a text input for numbers.
</doc>

<template>
    <Field v-bind="$props">
        <input
            v-model="model[field.key]"
            :id="field.key"
            :name="field.key"
            type="number"
        >
    </Field>
</template>

<script>
import Field from './Field';

export default {
    extends: Field,
    components: { Field },
};
</script>
