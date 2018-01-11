<doc>
The component that can draw a Dot's label within a Grapher.
</doc>

<template>
    <g class="dot-label">
    </g>
</template>

<script>
import { PixelCoordinate } from 'calchart/Coordinate';

export default {
    props: {
        position: {
            // The position of a Dot for a Sheet.
            type: PixelCoordinate,
            required: true,
        },
        label: {
            // The label of a Dot.
            type: String,
            required: true,
        },
    },
};
</script>
