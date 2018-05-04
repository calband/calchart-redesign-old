<doc>
A basic toolbar item for selecting a tool.
</doc>

<template>
    <ToolbarItemCustom :class="{ active: isActive }">
        <i :data-icon="tool.toolInfo.icon" />
    </ToolbarItemCustom>
</template>

<script>
import { isUndefined } from 'lodash';

import { isVue } from 'utils/vue';

import ToolbarItemCustom from './ToolbarItemCustom';

export default {
    props: {
        tool: {
            // The tool to load when clicked.
            type: Object,
            required: true,
            validator: isVue,
        },
    },
    components: {
        ToolbarItemCustom,
    },
    computed: {
        /**
         * @return {boolean} true if this tool is currently active.
         */
        isActive() {
            return false;
        },
    },
};
</script>

<style lang="scss" scoped>
$dimensions: $toolbar-height - 20px;

.toolbar-item {
    @include vertically-center;
    width: $dimensions;
    height: $dimensions;
    background: $blue;
    color: $white;
    border: 3px solid $blue;
    text-align: center;
    font-size: 20px;
    &.active {
        background: $white;
        color: $blue;
    }
}
</style>
