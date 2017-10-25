<doc>
A popup that contains a form to be submitted or modified.
</doc>

<template>
    <BasePopup>
        <h1 class="title">{{ title }}</h1>
        <form class="form-popup" @submit.prevent="submit">
            <formly-form
                ref="form"
                :form="form"
                :model="model"
                :fields="fields"
            ></formly-form>
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
import { ValidationError } from "utils/errors";
import { $vms } from "utils/vue";

import BasePopup from "./BasePopup";

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
        // Need following for vue-formly
        model: {
            type: null,
            required: true,
        },
        fields: {
            type: null,
            required: true,
        },
    },
    data() {
        return {
            form: {},
        };
    },
    methods: {
        /**
         * Submit the form.
         */
        submit() {
            this.$refs.form.validate()
                .then(() => {
                    if (!this.form.$valid) {
                        return;
                    }

                    this.$emit("submit");

                    if (this.hideOnSubmit) {
                        this.hide();
                    }
                })
                .catch(e => {
                    $vms.root.showError(e.message);
                });
        },
    },
};
</script>

<style lang="scss" scoped>
    button.cancel {
        @include display-button($red);
    }
</style>
