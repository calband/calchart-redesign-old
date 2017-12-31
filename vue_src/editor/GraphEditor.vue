<doc>
The component that displays an interface to edit graph-related aspects of the
show in the editor application.
</doc>

<template>
    <div class="graph-content">
        <SheetList :menu="true" />
        <div class="workspace"></div>
    </div>
</template>

<script>
import SheetList from 'editor/SheetList';

export default {
    components: {
        SheetList,
    },
};
</script>

<style lang="scss" scoped>
$sidebar-width: 200px;

.sidebar, .workspace {
    @include unselectable;
    display: inline-block;
    height: 100%;
    vertical-align: top;
}

.sidebar {
    width: $sidebar-width;
    padding: 20px;
    border-right: 3px double $medium-gray;
    overflow: auto;
    .stuntsheet {
        margin-bottom: 10px;
        height: $sidebar-width * 0.6;
        &:last-child {
            margin-bottom: 0;
        }
    }
}

.workspace {
    width: calc(100% - #{$sidebar-width});
}
</style>
