<doc>
The component that can draw a field and dots based on the state of a Sheet.
</doc>

<template>
    <div :class="['grapher-container', { fill }]">
        <svg v-if="sheet" :width="svgWidth" :height="svgHeight">
            <component
                :is="fieldGrapher"
                :scale="scale"
                v-bind="$attrs"
                class="field"
            />
            <g class="dots">
                <GrapherDot
                    v-for="dot in sheet.show.getDots()"
                    :key="dot.id"
                    :dotType="sheet.getDotInfo(dot).type"
                    :position="getPosition(dot)"
                    :scale="scale"
                    :zoom="zoom"
                    v-bind="$attrs"
                    :class="`dot-${dot.id}`"
                />
            </g>
            <!-- separate to keep labels in another layer -->
            <g class="dot-labels">
                <GrapherDotLabel
                    v-for="dot in sheet.show.getDots()"
                    :key="dot.id"
                    :position="getPosition(dot)"
                    :label="dot.label"
                    :labelLeft="labelLeft"
                    :zoom="zoom"
                />
            </g>
        </svg>
    </div>
</template>

<script>
import { BaseFieldType } from 'calchart/FieldType';
import { PixelCoordinate } from 'calchart/Coordinate';
import Sheet from 'calchart/Sheet';

import CollegeField from './CollegeField';
import GrapherDot from './GrapherDot';
import GrapherDotLabel from './GrapherDotLabel';
import GrapherScale from './GrapherScale';

// The dimensions of the SVG object at 100% zoom
const SVG_HEIGHT = 900;
const SVG_WIDTH = 1600;

export default {
    props: {
        sheet: {
            // The currently active Sheet
            type: Sheet,
        },
        beat: {
            // The beat to draw on the Sheet
            type: Number,
            default: 0,
        },

        // Options to customize aspects of the Grapher

        eastUp: {
            // If true, the top edge is east
            type: Boolean,
            default: false,
        },
        fieldPadding: {
            // The amount of space between the field and the SVG
            type: Number,
            default: 30,
        },
        fill: {
            // If true, fill all available space.
            type: Boolean,
            default: false,
        },
        labelLeft: {
            // If true, put labels on the left of the dot
            type: Boolean,
            default: true,
        },
        zoom: {
            // The zoom of the Grapher
            type: Number,
            default: 1,
        },
    },
    components: { GrapherDot, GrapherDotLabel },
    data() {
        return {
            height: 0,
            width: 0,
        };
    },
    mounted() {
        if (this.fill) {
            this.height = this.$el.offsetHeight;
            this.width = this.$el.offsetWidth;
        } else {
            this.height = SVG_HEIGHT;
            this.width = SVG_WIDTH;
        }
    },
    computed: {
        /**
         * @return {Component} The field to graph as determined by the Sheet.
         */
        fieldGrapher() {
            switch (this.fieldType) {
                case BaseFieldType.COLLEGE:
                    return CollegeField;
            }
        },
        /**
         * @return {BaseFieldType} The field type being drawn for the Sheet.
         */
        fieldType() {
            return this.sheet.getFieldType();
        },
        /**
         * @return {GrapherScale} The scale information of the Grapher.
         */
        scale() {
            let [fieldWidth, fieldHeight] = this.fieldType.dimensions;
            // fix not updating when mounted
            return new GrapherScale(
                fieldWidth,
                fieldHeight,
                this.svgWidth,
                this.svgHeight,
                {
                    fieldPadding: this.fieldPadding,
                    eastUp: this.eastUp,
                }
            );
        },
        /**
         * @return {number} The height of the SVG.
         */
        svgHeight() {
            return this.height * this.zoom;
        },
        /**
         * @return {number} The width of the SVG.
         */
        svgWidth() {
            return this.width * this.zoom;
        },
    },
    methods: {
        /**
         * @param {Dot} dot
         * @return {PixelCoordinate} The position of the dot in the Sheet.
         */
        getPosition(dot) {
            if (this.$el) {
                // TODO: add beat
                let info = this.sheet.getDotInfo(dot);
                return this.scale.toPixels(info.position);
            } else {
                // component not mounted yet
                return new PixelCoordinate(0, 0);
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.grapher-container.fill {
    width: 100%;
    height: 100%;
}
</style>
