<doc>
A popup for adding a Formation to a Show.
</doc>

<template>
    <FormPopup
        :on-submit="addFormation"
        :model="model"
        :fields="fields"
        title="Add Formation"
    />
</template>

<script>
import Formation from 'calchart/Formation';

import BasePopup from './BasePopup';
import FormPopup from './FormPopup';

export default {
    extends: BasePopup,
    components: { FormPopup },
    data() {
        return {
            model: {
                name: '',
            },
            fields: [
                {
                    key: 'name',
                    type: 'text',
                    required: true,
                },
            ],
        };
    },
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
