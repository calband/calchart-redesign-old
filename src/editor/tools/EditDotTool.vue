<doc>
A basic toolbar item for selecting a tool.
</doc>

<template>
    <g>
        <!-- Helper dot that follows the cursor -->
        <circle
            :cx="snapX"
            :cy="snapY"
            :r="grapher.dotRadius"
            class="helper-cursor"
        />
        <!-- Dots that have been placed by drag -->
        <circle
            v-for="(dot, i) in dotsToAdd"
            :key="i"
            :cx="dot.x"
            :cy="dot.y"
            :r="grapher.dotRadius"
            class="helper"
        />
    </g>
</template>

<script>
import { StepCoordinate } from 'calchart/Coordinate';
import FormationDot from 'calchart/FormationDot';
import { unique } from 'utils/array';

import EditTool from './EditTool';

export default {
    extends: EditTool,
    toolInfo: {
        label: 'Add/Remove Dots',
        icon: 'plus-minus',
    },
    data() {
        return {
            dotsToAdd: [],
        };
    },
    methods: {
        onMousemove(e) {
            if (this.isMousedown) {
                this.dotsToAdd.push({
                    x: this.snapX,
                    y: this.snapY,
                });
            }
        },
        onMouseup(e) {
            let dotsToAdd = unique(this.dotsToAdd).map(dot =>
                FormationDot.create({
                    position: this.scale.toSteps(dot),
                })
            );
            this.$store.dispatch('editor/modifyShow', {
                target: this.$store.state.editor.formation,
                func: 'addFormationDots',
                args: [dotsToAdd],
            });

            this.dotsToAdd = [];
        },
    },
};
</script>

<style lang="scss" scoped>
.helper-cursor, .helper {
    fill: rgba($gold, 0.75);
}
</style>
