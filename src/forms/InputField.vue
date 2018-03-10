<doc>
A form field that renders a simple text input.
</doc>

<template>
    <Field v-bind="$props">
        <input
            v-model="model[field.key]"
            :id="field.key"
            :name="field.key"
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
