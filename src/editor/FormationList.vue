<docs>
The sidebar containing a list of formations for the editor.
</docs>

<template>
    <div>
        <div class="scrollable">
            <div
                v-for="formation in formations"
                :key="formation.id"
                class="formation"
                data-cy="formation"
            >
                <div class="formation-name">
                    <span>{{ formation.name }}</span>
                    <i :data-icon="getFormationIcon(formation)" />
                </div>
                <div :class="['formation-graph', getActive(formation)]">
                    <Grapher
                        :draw-yardlines="false"
                        :field-padding="15"
                        :fill="true"
                        :formation="formation"
                        @click-graph="chooseFormation(formation)"
                    />
                </div>
            </div>
        </div>
        <button
            class="add-formation"
            data-cy="add-formation"
            @click="showPopup(AddFormationPopup)"
        >Add</button>
    </div>
</template>

<script>
import Formation from 'calchart/Formation';
import Grapher from 'grapher/Grapher';
import AddFormationPopup from 'popups/AddFormationPopup';
import { validateType } from 'utils/types';

export default {
    props: {
        formations: {
            // The formations to show in the sidebar
            type: Array,
            required: true,
            validator: validateType({
                _type: 'array',
                _wraps: Formation,
            }),
        },
    },
    components: {
        Grapher,
    },
    constants: {
        AddFormationPopup,
    },
    created() {
        if (this.formations.length > 0) {
            this.chooseFormation(this.formations[0]);
        }
    },
    methods: {
        /**
         * Make the given Formation active.
         *
         * @param {Formation} formation
         */
        chooseFormation(formation) {
            this.$store.commit('editor/setFormation', formation);
        },
        /**
         * Get an object containing the `active` class.
         *
         * @param {Formation} formation
         * @return {object}
         */
        getActive(formation) {
            return {
                active: formation === this.$store.state.editor.formation,
            };
        },
        /**
         * Get the icon for the given Formation that indicates its dot count.
         *
         * @param {Formation} formation
         * @return {string}
         */
        getFormationIcon(formation) {
            return formation.dots.length === this.$store.state.show.dots.length
                ? 'check-circle' : 'x-circle';
        },
    },
};
</script>

<style lang="scss" scoped>
.scrollable {
    height: calc(100% - #{$toolbar-height});
    padding: 10px;
    .formation {
        margin-bottom: 10px;
        &:last-child {
            margin-bottom: 0;
        }
    }
    .formation-name {
        margin-bottom: 5px;
        font-size: $font-size * 1.1;
        i {
            font-size: 0.9em;
            float: right;
            &[data-icon=check-circle] {
                color: $green;
            }
            &[data-icon=x-circle] {
                color: $red;
            }
        }
    }
    .formation-graph {
        width: 100%;
        height: 120px;
        border: 3px solid $blue;
        &.active {
            border-color: $gold;
        }
    }
}

button.add-formation {
    margin: 5px auto;
    display: block;
}
</style>
