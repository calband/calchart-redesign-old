<docs>
The page that lets the user edit a show in the editor.
</docs>

<template>
    <div>
        <FormationList
            v-if="isFormationContext"
            :formations="show.formations"
            :style="{ width: leftSidebarWidth }"
            class="formation-list"
        />
        <div :style="{ width: workspaceWidth }" class="workspace">
            <Grapher
                :draw-four-step="true"
                :draw-yardline-numbers="true"
                :dot-positions="dotPositions"
                :formation="activeFormation"
                class="grapher"
                @mousedown="$refs.editTool.mousedown($event)"
                @mousemove="$refs.editTool.mousemove($event)"
                @mouseup="$refs.editTool.mouseup($event)"
            >
                <component
                    ref="editTool"
                    :is="$store.state.editor.tool"
                    v-bind="grapher"
                    slot-scope="grapher"
                />
            </Grapher>
            <component :is="toolbar" class="toolbar" />
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';

import Grapher from 'grapher/Grapher';

import ContextType from './ContextType';
import FormationList from './FormationList';
import FormationToolbar from './toolbar/FormationToolbar';

export default {
    components: {
        FormationList,
        Grapher,
    },
    data() {
        return {
            leftSidebarWidth: 200,
            contentWidth: null, // TODO: resize window
            rightSidebarWidth: 200,
        };
    },
    created() {
        this.$store.dispatch('editor/reset');
    },
    mounted() {
        this.contentWidth = this.$el.offsetWidth;
    },
    computed: {
        /**
         * @return {Formation} The currently active Formation.
         */
        activeFormation() {
            return this.$store.state.editor.formation;
        },
        /**
         * @return {Object<Dot: PixelCoordinate>}
         */
        dotPositions() {
            switch (this.$store.state.editor.context) {
                case ContextType.FORMATION:
                    return {};
            }
        },
        /**
         * @return {boolean}
         */
        isFormationContext() {
            return this.$store.state.editor.context === ContextType.FORMATION;
        },
        /**
         * @return {Component} The toolbar to load.
         */
        toolbar() {
            switch (this.$store.state.editor.context) {
                case ContextType.FORMATION:
                    return FormationToolbar;
            }
        },
        /**
         * @return {number}
         */
        workspaceWidth() {
            let sides = this.leftSidebarWidth;
            if (this.$store.state.editor.context === ContextType.FLOW) {
                sides += this.rightSidebarWidth;
            }
            return this.contentWidth - sides;
        },
        ...mapState('editor', ['show']),
    },
};
</script>

<style lang="scss" scoped>
$formation-list-width: 200px;

.formation-list {
    display: inline-block;
    width: $formation-list-width;
    vertical-align: top;
    box-shadow: 0 0 5px $dark-gray;
    z-index: z-index(sidebar);
}

.workspace {
    display: inline-block;
    width: calc(100% - #{$formation-list-width});
    vertical-align: top;
    .grapher {
        height: calc(100% - #{$toolbar-height});
        overflow: scroll;
    }
    .toolbar {
        height: $toolbar-height;
        background: $light-gray;
        z-index: z-index(toolbar);
        box-shadow: 1px -1px 3px $dark-gray;
        padding: 10px;
    }
}
</style>
