<doc>
The component that displays an interface to edit graph-related aspects of the
show in the editor application.
</doc>

<template>
    <div class="graph-content">
        <SheetList
            :menu="true"
            :width="sidebarWidth"
        />
        <Grapher
            :sheet="$store.state.editor.sheet"
            :drawFourStep="true"
            :drawYardlineNumbers="true"
            :zoom="$store.state.editor.zoom"
            :style="{ width: this.workspaceWidth }"
            class="workspace"
        />
    </div>
</template>

<script>
import $ from 'jquery';

import Grapher from 'grapher/Grapher';

import SheetList from './SheetList';

export default {
    components: { Grapher, SheetList },
    data() {
        return {
            sidebarWidth: 200, // TODO: click and drag to change width
            contentWidth: null, // TODO: resize window
        };
    },
    mounted() {
        this.contentWidth = this.$el.offsetWidth;
    },
    computed: {
        /**
         * Compute the workspace width according to the sidebar width.
         *
         * @return {number}
         */
        workspaceWidth() {
            return this.contentWidth - this.sidebarWidth;
        },
    },
};
</script>

<style lang="scss" scoped>
.workspace {
    @include unselectable;
    display: inline-block;
    height: 100%;
    vertical-align: top;
    overflow: auto;
}
</style>
