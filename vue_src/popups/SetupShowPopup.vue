<doc>
A popup for setting up a show when opening it for the first time in the editor
application.
</doc>

<template>
    <FormPopup
        title="Set Up Show"
        :onSubmit="saveShow"
        :allowHide="false"
        :model="model"
        :fields="fields"
    />
</template>

<script>
import store from 'store';
import Show from 'calchart/Show';
import { DOT_FORMATS, SHOW_FIELD_TYPES } from 'utils/CalchartUtils';

import { BasePopup, FormPopup } from './lib';
import { positive } from './validators';

export default {
    extends: BasePopup,
    components: { FormPopup },
    data() {
        return {
            model: {
                numDots: '',
                dotFormat: 'combo',
                fieldType: 'college',
            },
            fields: [
                {
                    key: 'numDots',
                    type: 'number',
                    required: true,
                    validators: {
                        positive,
                    },
                    templateOptions: {
                        label: 'Number of dots',
                    },
                },
                {
                    key: 'dotFormat',
                    type: 'choice',
                    templateOptions: {
                        choices: DOT_FORMATS,
                    },
                },
                {
                    key: 'fieldType',
                    type: 'choice',
                    templateOptions: {
                        choices: SHOW_FIELD_TYPES,
                    },
                },
            ],
        };
    },
    methods: {
        /**
         * Save the show after being set up.
         */
        saveShow(data) {
            let metadata = store.state.editor.newShowData;
            let show = Show.create(
                metadata.name,
                metadata.slug,
                metadata.isBand,
                data
            );
            store.commit('setShow', show);
            store.dispatch('editor/saveShow', {
                success: () => {
                    this.hide();
                },
            });

            return false;
        },
    },
};
</script>
