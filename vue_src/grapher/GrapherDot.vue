<doc>
The component that can draw a Dot within a Grapher.
</doc>

<template>
    <g
        :transform="`translate(${position.x}, ${position.y})`"
        class="dot"
    >
    </g>
</template>

<script>
import { PixelCoordinate } from 'calchart/Coordinate';
import DotType from 'calchart/DotType';

export default {
    props: {
        position: {
            // The position of the Dot to draw.
            type: PixelCoordinate,
            required: true,
        },
        dotType: {
            // The dot type of the Dot in the Sheet.
            type: DotType,
            required: true,
        },
    },
};
</script>
