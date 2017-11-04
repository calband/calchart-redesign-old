<doc>
A popup for creating a new show.
</doc>

<template>
    <FormPopup
        title="Create Show"
        :onSubmit="createShow"
        :model="model"
        :fields="fields"
    >
        <template slot="buttons" v-if="isSaving">
            <p>Saving...</p>
        </template>
    </FormPopup>
</template>

<script>
import _ from 'lodash';

import { BasePopup, FormPopup } from './lib';

import sendAction, { handleError } from 'utils/actions';
import { IS_STUNT } from 'utils/env';

export default {
    components: { FormPopup },
    extends: BasePopup,
    data() {
        return {
            isSaving: false,
            model: {
                name: '',
                isBand: IS_STUNT,
            },
            fields: [
                {
                    key: 'name',
                    type: 'text',
                    required: true,
                },
                {
                    key: 'isBand',
                    type: 'checkbox',
                    display: () => IS_STUNT,
                    templateOptions: {
                        label: 'For Cal Band',
                    },
                },
            ],
        };
    },
    methods: {
        /**
         * Create a show with the given form values.
         */
        createShow(data) {
            this.isSaving = true;

            sendAction('create_show', data, {
                success: data => {
                    this.hide();
                    this.$router.push({
                        name: 'editor',
                        params: {
                            slug: data.slug,
                        },
                    });
                },
                error: xhr => {
                    handleError(xhr);
                    this.isSaving = false;
                },
            });

            return false;
        },
    },
};
</script>
