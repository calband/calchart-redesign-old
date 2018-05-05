<doc>
A popup for adding a Formation to a Show.
</doc>

<template>
    <FormPopup
        :on-submit="addFormation"
        :model="model"
        :fields="FIELDS"
        title="Add Formation"
    />
</template>

<script>
import Formation from 'calchart/Formation';
import { extractInitial } from 'forms/fields';

import BasePopup from './BasePopup';
import FormPopup from './FormPopup';

const FIELDS = [
    {
        key: 'name',
        initial: '',
        type: 'text',
        required: true,
    },
];

export default {
    extends: BasePopup,
    components: { FormPopup },
    data() {
        return {
            model: extractInitial(FIELDS),
        };
    },
    constants: { FIELDS },
    methods: {
        /**
         * Add a Formation to the Show with the given form values.
         *
         * @param {object} data
         */
        addFormation(data) {
            let formation = Formation.create(data);
            this.store.dispatch('editor/modifyShow', {
                func: 'addFormation',
                args: [formation],
            }).then(() => {
                this.store.commit('editor/setFormation', formation);
            });
        },
    },
};
</script>
