<doc>
A form field that renders a checkbox.
</doc>

<template>
    <Field v-bind="$props">
        <input
            v-model="model[field.key]"
            :id="field.key"
            :name="field.key"
            type="checkbox"
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
