<doc>
The base component for a form field.
</doc>

<template>
    <div class="field">
        <label :for="name">{{ label }}:</label>
        <slot></slot>
        <ul
            v-if="errors.length > 0"
            class="messages"
        >
            <li
                v-for="error in errors"
                class="message error"
            >{{ error }}</li>
        </ul>
    </div>
</template>

<script>
import _ from "lodash";

import { ValidationError } from "utils/errors";
import { empty } from "utils/JSUtils";

export default {
    props: {
        name: {
            type: String,
            required: true,
        },
        label: {
            type: String,
            default: function() {
                return _.capitalize(_.lowerCase(this.name));
            },
        },
        initial: null,
        required: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            value: this.initial,
            errors: [],
        };
    },
    computed: {
        /**
         * @return {Vue} The base Field component.
         */
        baseField() {
            if (this.$options._componentTag === "Field") {
                return this;
            } else {
                return this.$children[0].baseField;
            }
        },
    },
    methods: {
        /**
         * Validate this field, throwing a ValidationError if the field
         * fails validation.
         *
         * @return {*} The value of the field.
         */
        clean() {
            if (this.required && !this.value) {
                throw new ValidationError(`${this.label} is required.`);
            }
            return this.cleanField();
        },
        /**
         * Hook for subclasses to further validate and clean the value.
         *
         * @return {*} The value of the field.
         */
        cleanField() {
            return this.value;
        },
        /**
         * Clear all errors for the field.
         */
        clearErrors() {
            empty(this.baseField.errors)
        },
        /**
         * Display the given message as an error.
         *
         * @param {String} message
         */
        showError(message) {
            this.baseField.errors.push(message);
        },
    },
};
</script>
