<docs>
The page that lets the user create a new show in the editor.
</docs>

<template>
    <div class="setup-show-component">
        <h1>Create Show</h1>
        <form @submit.prevent="submit">
            <formly-form
                ref="form"
                :form="form"
                :model="model"
                :fields="fields"
            />
            <button>Finish</button>
        </form>
    </div>
</template>

<script>
import { extend } from 'lodash';

import DotLabelFormat from 'calchart/DotLabelFormat';
import FieldType from 'calchart/FieldType';
import Orientation from 'calchart/Orientation';
import Show from 'calchart/Show';
import StepType from 'calchart/StepType';
import { positive } from 'forms/validators';
import sendAction from 'utils/ajax';

export default {
    data() {
        const IS_STUNT = this.$store.state.env.isStunt;
        return {
            form: {},
            model: {
                name: '',
                isBand: IS_STUNT,
                numDots: '',
                // TODO: add rest of form
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
                {
                    key: 'numDots',
                    type: 'number',
                    required: true,
                    validators: {
                        positive,
                    },
                    templateOptions: {
                        label: 'How many dots in the show?',
                    },
                },
            ],
        };
    },
    methods: {
        /**
         * Create a Show with the given data.
         *
         * @param {object} data
         */
        createShow(data) {
            data.slug = ''; // will be populated in back-end

            let show;
            try {
                show = Show.create(data);
            } catch (e) {
                this.$store.dispatch('messages/showError', e.message);
                return;
            }

            sendAction('create_show', show.serialize(), {
                success: ({ slug }) => {
                    // modifying private variable because this should
                    // be the ONLY place the slug is modified
                    show._slug = slug;
                    this.$store.commit('setShow', show);
                    this.$router.push({
                        path: `/editor/${slug}`,
                    });
                },
            });
        },
        /**
         * Submit the form.
         */
        submit() {
            this.$refs.form.validate()
                .then(() => {
                    if (!this.form.$valid) {
                        return;
                    }

                    let data = extend({}, this.model);

                    data.numDots = parseInt(data.numDots);

                    // TODO: temporary until set up form is implemented
                    data.dotGroups = {};
                    data.labelFormat = DotLabelFormat.COMBO;
                    data.audioUrl = null;
                    data.songs = [];
                    data.fieldType = FieldType.COLLEGE;
                    data.beatsPerStep = [1, 1];
                    data.stepType = StepType.HIGH_STEP;
                    data.orientation = Orientation.EAST;

                    this.createShow(data);
                })
                .catch(e => {
                    // BUG: closing error message should not close popup
                    this.$store.dispatch('messages/showError', e.message);
                });
        },
    },
};
</script>

<style lang="scss" scoped>
.setup-show-component {
    text-align: center;
}
</style>
