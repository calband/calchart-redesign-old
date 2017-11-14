<doc>
A form field that renders a select input.
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
import BaseField from './BaseField';

export default {
    mixins: [BaseField],
};
</script>
