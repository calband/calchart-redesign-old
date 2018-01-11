<doc>
The component that can draw a college field in a Grapher.
</doc>

<template>
    <g class="field-college">
        <rect class="field-background" />
        <rect
            :width="scale.width"
            :height="scale.height"
            :x="scale.minX"
            :y="scale.minY"
            :class="['field-border', { bold: drawYardlines }]"
        />
        <template v-if="drawYardlines">
            <template v-if="drawFourStep">
                <line
                    v-for="yOffset in fourStepYOffsets"
                    :x1="scale.minX"
                    :y1="yOffset"
                    :x2="scale.maxX"
                    :y2="yOffset"
                    class="four-step"
                />
                <line
                    v-for="xOffset in fourStepXOffsets"
                    :x1="xOffset"
                    :y1="scale.minY"
                    :x2="xOffset"
                    :y2="scale.maxY"
                    class="four-step"
                />
            </template>
            <template
                v-for="yardline in yardlineInfo"
                v-if="yardline.number !== 0"
            >
                <line
                    :x1="yardline.offset"
                    :y1="scale.minY"
                    :x2="yardline.offset"
                    :y2="scale.maxY"
                    class="yardline"
                />
                <line
                    :x1="yardline.offset - hashWidth/2"
                    :y1="hashOffsetBack"
                    :x2="yardline.offset + hashWidth/2"
                    :y2="hashOffsetBack"
                    class="hash back-hash"
                />
                <line
                    :x1="yardline.offset - hashWidth/2"
                    :y1="hashOffsetFront"
                    :x2="yardline.offset + hashWidth/2"
                    :y2="hashOffsetFront"
                    class="hash front-hash"
                />
            </template>
            <template v-if="drawYardlineNumbers">
                <template v-for="yardline in yardlineInfo">
                    <text
                        v-for="sideline in sidelineInfo"
                        :x="yardline.offset"
                        :y="sideline.offset"
                        :font-size="fontSize"
                        v-bind="sideline.position"
                        class="yardline-label"
                    >{{ yardline.number }}</text>
                </template>
            </template>
        </template>
    </g>
</template>

<script>
import { range } from 'lodash';

import GrapherScale from './GrapherScale';

export default {
    props: {
        scale: {
            type: GrapherScale,
            required: true,
        },

        // Options to customize the field

        drawFourStep: {
            // If true, draw the 4-step intervals
            type: Boolean,
            default: false,
        },
        drawYardlineNumbers: {
            // If true, draw the yardlines numbers
            type: Boolean,
            default: false,
        },
        drawYardlines: {
            // If true, draw yardlines
            type: Boolean,
            default: true,
        },
    },
    constants: {
        VERTICAL_4_STEP: range(4, 160, 8), // steps from north endzone
        HORIZONTAL_4_STEP: range(4, 84, 4), // steps from west sideline
        YARDLINES: range(8, 160, 8), // excluding 0 yardlines
    },
    computed: {
        /**
         * @return {number} The font size for the yardline numbers.
         */
        fontSize() {
            return this.scale.toPixels(2.5);
        },
        /**
         * @return {number[]} The x-offsets for the vertical 4-step lines
         *   (excluding yardlines).
         */
        fourStepXOffsets() {
            return range(4, 160, 8).map(i => this.scale.toPixelsX(i));
        },
        /**
         * @return {number[]} The y-offsets for the horizontal 4-step lines.
         */
        fourStepYOffsets() {
            return range(4, 84, 4).map(i => this.scale.toPixelsY(i));
        },
        /**
         * @return {number} The y-offset for the back hash.
         */
        hashOffsetBack() {
            return this.scale.toPixelsY(32);
        },
        /**
         * @return {number} The y-offset for the front hash.
         */
        hashOffsetFront() {
            return this.scale.toPixelsY(52);
        },
        /**
         * @return {number} The width of a hash mark; 2 steps wide.
         */
        hashWidth() {
            return this.scale.toPixels(2);
        },
        /**
         * @return {Object[]} Information about the front/back sideline,
         *   including:
         *   - {number} offset - The y-offset for the yardline number off the
         *     sideline
         *   - {number} position - The positioning attributes for the sideline
         */
        sidelineInfo() {
            return [
                // west sideline
                {
                    offset: this.scale.minY,
                    position: {
                        'dominant-baseline': 'text-after-edge',
                        'text-anchor': 'middle',
                    },
                },
                // east sideline
                {
                    offset: this.scale.maxY + this.fontSize / 5,
                    position: {
                        'dominant-baseline': 'text-before-edge',
                        'text-anchor': 'middle',
                    },
                },
            ];
        },
        /**
         * @return {Object[]} Information about a yardline, including:
         *   - {number} offset - The x-offset for the yardline
         *   - {number} number - The yardline number
         */
        yardlineInfo() {
            return range(0, 21).map(i => {
                return {
                    offset: this.scale.toPixelsX(i * 8),
                    number: -Math.abs(i * 5 - 50) + 50,
                };
            });
        },
    },
};
</script>

<style lang="scss" scoped>
.field-background {
    width: 100%;
    height: 100%;
    fill: $field-green;
}
.field-border {
    fill: none;
    stroke: $white;
    &.bold {
        stroke-width: 2px;
    }
}
.yardline {
    stroke: $white;
    stroke-width: 2px;
}
.yardline-label {
    fill: $white;
}
.hash {
    stroke: $white;
    stroke-width: 2px;
}
.four-step {
    stroke: $white;
    stroke-dasharray: 5;
}
</style>
