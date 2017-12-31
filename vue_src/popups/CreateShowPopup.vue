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
import router from 'router';
import store from 'store';
import sendAction, { handleError } from 'utils/ajax';

import { BasePopup, FormPopup } from './lib';

export default {
    extends: BasePopup,
    components: { FormPopup },
    data() {
        const IS_STUNT = store.state.env.isStunt;
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
                    router.push({
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
