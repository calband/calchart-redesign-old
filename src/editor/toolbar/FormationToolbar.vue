<doc>
The toolbar for the Formation context.
</doc>

<template>
    <div data-cy="formation-toolbar">
        <ToolbarItem :tool="EditDotTool" data-cy="edit-dot" />
    </div>
</template>

<script>
import EditDotTool from 'editor/tools/EditDotTool';

import ToolbarItem from './ToolbarItem';

export default {
    components: {
        ToolbarItem,
    },
    constants: {
        EditDotTool,
    },
};
</script>

<style lang="scss" scoped>
</style>
