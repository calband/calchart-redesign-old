<doc>
A popup for adding a Sheet to a Show.
</doc>

<template>
    <FormPopup
        title="Add Sheet"
        :onSubmit="addSheet"
        :model="model"
        :fields="fields"
    />
</template>

<script>
import store from 'store';

import { BasePopup, FormPopup } from './lib';
import { positive } from './validators';

export default {
    extends: BasePopup,
    components: { FormPopup },
    data() {
        return {
            isSaving: false,
            model: {
                numBeats: '',
            },
            fields: [
                {
                    key: 'numBeats',
                    type: 'number',
                    required: true,
                    validators: {
                        positive,
                    },
                    templateOptions: {
                        label: 'Number of beats',
                    },
                },
            ],
        };
    },
    methods: {
        /**
         * Add a Sheet to the Show with the given form values.
         */
        addSheet(data) {
            store.dispatch('editor/doAction', { name: 'addSheet', data });
        },
    },
};
</script>
