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
                :formation="$store.state.editor.formation"
                class="grapher"
            />
            <div class="toolbar">TODO: Toolbar</div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';

import Grapher from 'grapher/Grapher';

import ContextType from './ContextType';
import FormationList from './FormationList';

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
    mounted() {
        this.contentWidth = this.$el.offsetWidth;
    },
    computed: {
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
         * @return {number}
         */
        workspaceWidth() {
            let sides = this.leftSidebarWidth;
            if (this.$store.state.editor.context === ContextType.FLOW) {
                sides += this.rightSidebarWidth;
            }
            return this.contentWidth - sides;
        },
        ...mapState(['show']),
    },
};
</script>

<style lang="scss" scoped>
$formation-list-width: 200px;

.formation-list {
    display: inline-block;
    width: $formation-list-width;
    vertical-align: top;
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
    }
}
</style>
