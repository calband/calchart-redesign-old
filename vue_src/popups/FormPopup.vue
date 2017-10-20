<doc>
A popup that contains a form to be submitted or modified.
</doc>

<template>
    <BasePopup>
        <h1 class="title">{{ title }}</h1>
        <form class="form-popup" @submit.prevent="submit">
            <slot></slot>
            <div class="buttons">
                <button>Save</button>
                <button
                    v-if="allowCancel"
                    @click="hide"
                    class="cancel"
                    type="button"
                >Cancel</button>
            </div>
        </form>
    </BasePopup>
</template>

<script>
import BasePopup from "./BasePopup";

import { ValidationError } from "utils/errors";

export default {
    components: { BasePopup },
    extends: BasePopup,
    props: {
        title: {
            type: String,
            required: true,
        },
        allowCancel: {
            type: Boolean,
            default: true,
        },
        hideOnSubmit: {
            type: Boolean,
            default: true,
        },
    },
    methods: {
        /**
         * Submit the form.
         */
        submit() {
            let fields = this.$children[0].$children;
            let values = {};
            let hasError = false;

            // TODO: fix validation
            _.each(fields, field => {
                field.clearErrors();
                try {
                    values[field.name] = field.clean();
                } catch (ex) {
                    if (ex instanceof ValidationError) {
                        hasError = true;
                        field.showError(ex.message);
                    }
                }
            });

            if (hasError) {
                return;
            }

            this.$emit("submit", values);

            if (this.hideOnSubmit) {
                this.hide();
            }
        },
    },
};
</script>

<style lang="scss">
// non-scoped since elements in <slot> tags are scoped to the children
form.form-popup {
    .form-group {
        margin: 10px 0;
    }
    .field-wrap {
        display: inline-block;
    }
}
</style>

<style lang="scss" scoped>
button.cancel {
    @include display-button($red);
}
</style>
