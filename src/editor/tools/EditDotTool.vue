<doc>
A basic toolbar item for selecting a tool.
</doc>

<template>
    <g>
        <circle
            :cx="helperPosition.x"
            :cy="helperPosition.y"
            :r="helperRadius"
            class="helper"
        />
    </g>
</template>

<script>
import EditTool from './EditTool';

export default {
    extends: EditTool,
    toolInfo: {
        label: 'Add/Remove Dots',
        icon: 'plus-minus',
    },
    computed: {
        /**
         * The radius of the helper dot in pixels.
         *
         * The helper dot shall have a radius of 1 step.
         *
         * @return {number}
         */
        helperRadius() {
            return this.scale.toPixels(1);
        },
        /**
         * The coordinates of the helper dot, snapped to the grid.
         *
         * @return {PixelCoordinate}
         */
        helperPosition() {
            // TODO: make grid settable
            let grid = 2;
            return this.scale.snapPixels({
                x: this.cursorX,
                y: this.cursorY,
            }, grid);
        },
    },
};
</script>

<style lang="scss" scoped>
.helper {
    fill: rgba($gold, 0.75);
}
</style>
