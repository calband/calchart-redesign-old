<docs>
The sidebar containing a list of formations for the editor.
</docs>

<template>
    <div>
        <div class="scrollable">
            <div v-for="formation in formations" class="formation">
                <div class="formation-name">
                    <span>{{ formation.name }}</span>
                    <i :data-icon="getFormationIcon(formation)" />
                </div>
                <div class="formation-graph">
                    <Grapher
                        :drawYardlines="false"
                        :fieldPadding="15"
                        :fill="true"
                        :formation="formation"
                    />
                </div>
            </div>
        </div>
        <button
            @click="showPopup(AddFormationPopup)"
            class="add-formation"
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
    methods: {
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
    }
}

button.add-formation {
    margin: 5px auto;
    display: block;
}
</style>
