<doc>
The base component for a form field.
</doc>

<template>
    <div class="field">
        <label :for="field.key">{{ label }}:</label>
        <slot />
        <error-display :form="form" :field="field.key" />
    </div>
</template>

<script>
import { capitalize, lowerCase } from 'lodash';
import baseField from 'vue-formly-bootstrap/src/fields/baseField';

export default {
    mixins: [baseField],
    computed: {
        label() {
            return this.to.label
                ? this.to.label
                : capitalize(lowerCase(this.field.key));
        },
    },
};
</script>

<style lang="scss" scoped>
    // error-display
    span.text-danger {
        display: block;
        color: $red;
        margin: 5px 0;
    }
</style>
