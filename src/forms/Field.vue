<doc>
The base component for a form field.
</doc>

<template>
    <div class="field">
        <label :for="field.key">{{ label }}</label>
        <slot />
        <error-display :form="form" :field="field.key" />
    </div>
</template>

<script>
import { capitalize, defaultTo, endsWith, lowerCase, some } from 'lodash';
import baseField from 'vue-formly-bootstrap/src/fields/baseField';

const PUNCTUATION = ['.', ':', '?', '!'];

export default {
    mixins: [baseField],
    computed: {
        label() {
            let label = defaultTo(
                this.to.label,
                capitalize(lowerCase(this.field.key))
            );

            if (!some(PUNCTUATION, v => endsWith(label, v))) {
                label += ':';
            }

            return label;
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
