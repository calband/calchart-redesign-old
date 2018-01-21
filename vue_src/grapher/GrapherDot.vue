<doc>
The component that can draw a Dot within a Grapher.
</doc>

<template>
    <g
        :transform="`translate(${position.x}, ${position.y})`"
        class="dot"
    >
        <line
            v-if="slashInfo.forward"
            :x1="slashInfo.start"
            :y1="slashInfo.end"
            :x2="slashInfo.end"
            :y2="slashInfo.start"
            class="slash"
        />
        <line
            v-if="slashInfo.back"
            :x1="slashInfo.start"
            :y1="slashInfo.start"
            :x2="slashInfo.end"
            :y2="slashInfo.end"
            class="slash"
        />
        <circle
            :r="dotRadius"
            :class="['dot-marker', `color-${dotColor}`]"
        />
    </g>
</template>

<script>
import { PixelCoordinate } from 'calchart/Coordinate';
import { CardinalDirection } from 'calchart/Direction';
import DotType from 'calchart/DotType';

import DotDisplay from './DotDisplay';

export default {
    props: {
        direction: {
            // The direction a Dot is facing.
            type: CardinalDirection,
            default: () => CardinalDirection.EAST,
        },
        dotRadius: {
            // The radius of the Dot.
            type: Number,
            required: true,
        },
        dotType: {
            // The dot type of the Dot in the Sheet.
            type: DotType,
            required: true,
        },
        position: {
            // The position of the Dot to draw.
            type: PixelCoordinate,
            required: true,
        },

        // Options to customize drawing a Dot

        format: {
            // The way to display a dot.
            type: DotDisplay,
            default: () => DotDisplay.NORMAL,
        },
    },
    computed: {
        /**
         * @return {String} The color of a dot.
         */
        dotColor() {
            switch (this.format) {
                case DotDisplay.NORMAL:
                    return "white";
                case DotDisplay.DOT_TYPE:
                    if (DotType.isPlain(this.dotType)) {
                        return "none";
                    } else {
                        return "white";
                    }
                case DotDisplay.ORIENTATION:
                    switch (this.direction) {
                        case CardinalDirection.EAST:
                            return "white";
                        case CardinalDirection.WEST:
                            return "yellow";
                        default:
                            return "blue";
                    }
            }
        },
        /**
         * @return {Object}
         *   - {boolean} forward
         *   - {boolean} back
         *   - {number} start
         *   - {number} end
         */
        slashInfo() {
            if (this.format === DotDisplay.DOT_TYPE) {
                return {
                    forward: false,
                    back: false,
                };
            } else {
                return {
                    ...DotType.getSlashes(this.dotType),
                    start: -1.1 * this.dotRadius,
                    end: 1.1 * this.dotRadius,
                };
            }
        },
    },
};
</script>

<style lang="scss" scoped>
line.slash {
    stroke: $uniform-white;
    stroke-width: 2px;
    pointer-events: none;
}

circle.dot-marker {
    stroke: $uniform-white;
    stroke-width: 2px;
    &.color-none {
        fill: transparent;
    }
    &.color-white {
        fill: $uniform-white;
    }
    &.color-yellow {
        fill: $uniform-yellow;
    }
    &.color-blue {
        fill: $uniform-blue;
    }
    &.color-purple {
        fill: $highlight-purple;
    }
    &.color-red {
        fill: $collision;
    }
}
</style>
