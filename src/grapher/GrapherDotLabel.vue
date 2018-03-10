<doc>
The component that can draw a Dot's label within a Grapher.
</doc>

<template>
    <text
        :text-anchor="labelLeft ? 'end' : 'start'"
        :font-size="dotRadius * 2"
        :transform="`translate(${position.x}, ${position.y})`"
        :x="(labelLeft ? 1 : -1) * offset"
        :y="offset"
        class="dot-label"
        dominant-baseline="text-after-edge"
    >{{ label }}</text>
</template>

<script>
import { PixelCoordinate } from 'calchart/Coordinate';

import GrapherScale from './GrapherScale';

export default {
    props: {
        dotRadius: {
            // The radius of the Dot.
            type: Number,
            required: true,
        },
        label: {
            // The label of a Dot.
            type: String,
            required: true,
        },
        position: {
            // The position of a Dot for a Sheet.
            type: PixelCoordinate,
            required: true,
        },
        scale: {
            type: GrapherScale,
            required: true,
        },

        // Options to customize drawing a Dot label

        labelLeft: {
            // If true, show the label on the left of the dot.
            type: Boolean,
            default: true,
        },
    },
    computed: {
        /**
         * @return {number} The offset of the label off the dot.
         */
        offset() {
            return -this.dotRadius / 2;
        },
    },
};
</script>

<style lang="scss" scoped>
text.dot-label {
    fill: $medium-gray;
    pointer-events: none;
}
</style>
