<doc>
A form field that renders a simple text input.
</doc>

<template>
    <Field v-bind="allProps">
        <input
            v-model="value"
            :id="name"
            :name="name"
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
            type: String,
        },
    },
    computed: { allProps },
};
</script>
