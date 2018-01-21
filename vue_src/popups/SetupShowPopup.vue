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
import DotLabelFormat from 'calchart/DotLabelFormat';
import { BaseFieldType } from 'calchart/FieldType';
import Show from 'calchart/Show';

import { BasePopup, FormPopup } from './lib';
import { positive } from './validators';

export default {
    extends: BasePopup,
    components: { FormPopup },
    data() {
        return {
            model: {
                numDots: '',
                labelFormat: DotLabelFormat.COMBO,
                fieldType: BaseFieldType.COLLEGE,
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
                    key: 'labelFormat',
                    type: 'choice',
                    templateOptions: {
                        enum: DotLabelFormat,
                    },
                },
                {
                    key: 'fieldType',
                    type: 'choice',
                    templateOptions: {
                        enum: BaseFieldType,
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
