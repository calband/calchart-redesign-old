<doc>
A form field that renders a simple text input.
</doc>

<template>
    <Field v-bind="allProps">
        <input
            v-model="model[field.key]"
            :id="field.key"
            :name="field.key"
        >
    </Field>
</template>

<script>
import BaseField from "./BaseField";

export default {
    mixins: [BaseField],
};
</script>
