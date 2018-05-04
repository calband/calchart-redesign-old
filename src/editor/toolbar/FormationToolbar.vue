<doc>
The toolbar for the Formation context.
</doc>

<template>
    <div>
        <ToolbarItem :tool="EditDotTool" />
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
