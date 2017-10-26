<doc>
The base component for a form field.
</doc>

<template>
    <div class="field">
        <label :for="field.key">{{ label }}:</label>
        <slot></slot>
        <error-display :form="form" :field="field.key"></error-display>
    </div>
</template>

<script>
import _ from 'lodash';
import baseField from 'vue-formly-bootstrap/src/fields/baseField';

export default {
    mixins: [baseField],
    computed: {
        label() {
            return this.to.label ? this.to.label : _.capitalize(_.lowerCase(this.field.key));
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
