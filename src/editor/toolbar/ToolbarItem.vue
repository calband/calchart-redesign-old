<doc>
A basic toolbar item for selecting a tool.
</doc>

<template>
    <ToolbarItemCustom :class="isActive" @click.native="setTool">
        <i :data-icon="tool.toolInfo.icon" />
    </ToolbarItemCustom>
</template>

<script>
import { mapGetters } from 'vuex';

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
            return {
                active: this.isActiveTool(this.tool),
            };
        },
        ...mapGetters('editor', ['isActiveTool']),
    },
    methods: {
        /**
         * Set the active tool to this tool.
         */
        setTool() {
            this.$store.commit('editor/setState', {
                tool: this.tool,
            });
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
