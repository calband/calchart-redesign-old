<doc>
A form field that renders a checkbox.
</doc>

<template>
    <Field v-bind="allProps">
        <input
            v-model="value"
            :id="name"
            :name="name"
            type="checkbox"
        >
    </Field>
</template>

<script>
import { allProps } from "utils/vue";

import Field from "./Field";

export default {
    components: { Field },
    extends: Field,
    props: {
        initial: {
            type: Boolean,
            default: false,
        },
    },
    computed: { allProps },
};
</script>
