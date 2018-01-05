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
        <div class="workspace"></div>
    </div>
</template>

<script>
import SheetList from 'editor/SheetList';

export default {
    components: {
        SheetList,
    },
    data() {
        return {
            sidebarWidth: 200, // TODO: click and drag to change width
        };
    },
    computed: {
        /**
         * Compute the workspace width according to the sidebar width.
         *
         * @return {number}
         */
        workspaceWidth() {
            return $(this.$el).width() - this.sidebarWidth;
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
}
</style>
