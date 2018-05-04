<doc>
A basic toolbar item for selecting a tool.
</doc>

<template>
    <div />
</template>

<script>
import EditTool from './EditTool';

export default {
    extends: EditTool,
    toolInfo: {
        label: 'Add/Remove Dots',
        icon: 'plus-minus',
    },
};
</script>

<style lang="scss" scoped>

</style>
