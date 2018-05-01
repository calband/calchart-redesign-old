<doc>
The component that can draw a field and dots on the field.
</doc>

<template>
    <div :class="['grapher-container', { fill }]">
        <svg :width="svgWidth" :height="svgHeight">
            <component
                :is="fieldGrapher"
                :scale="scale"
                v-bind="$attrs"
            />
            <g v-if="formation" class="dots">
                <GrapherDot
                    v-for="dot in formation.dots"
                    :key="dot.id"
                    :dotRadius="dotRadius"
                    :dotType="getDotType(dot)"
                    :position="getPosition(dot)"
                    :scale="scale"
                    v-bind="$attrs"
                />
            </g>
            <!-- separate to keep labels in another layer -->
            <g v-if="formation" class="dot-labels">
                <GrapherDotLabel
                    v-for="dot in formation.dots"
                    :key="dot.id"
                    :dotRadius="dotRadius"
                    :position="getPosition(dot)"
                    :label="dot.label"
                    :labelLeft="labelLeft"
                    :scale="scale"
                />
            </g>
        </svg>
    </div>
</template>

<script>
import { isNull, isUndefined } from 'lodash';

import FieldType from 'calchart/FieldType';
import Flow from 'calchart/Flow';
import Formation from 'calchart/Formation';
import { PixelCoordinate } from 'calchart/Coordinate';

import CollegeField from './CollegeField';
import GrapherDot from './GrapherDot';
import GrapherDotLabel from './GrapherDotLabel';
import GrapherScale from './GrapherScale';

// The dimensions of the SVG object at 100% zoom
const SVG_HEIGHT = 900;
const SVG_WIDTH = 1600;

const DOT_RADIUS = 0.75; // in steps

export default {
    props: {
        flow: {
            // The flow being edited, if applicable
            type: Flow,
            default: null,
        },
        formation: {
            // The formation being displayed
            type: Formation,
            default: null,
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
         * @return {number} The radius of a dot to draw.
         */
        dotRadius() {
            return this.scale.toPixels(DOT_RADIUS);
        },
        /**
         * @return {Component} The field to graph as determined by the Sheet.
         */
        fieldGrapher() {
            switch (this.fieldType) {
                case FieldType.COLLEGE:
                    return CollegeField;
            }
        },
        /**
         * @return {FieldType} The field type to display.
         */
        fieldType() {
            let show = this.$store.state.show;
            if (this.flow) {
                return this.flow.getFieldType(show, this.formation);
            } else if (this.formation) {
                return this.formation.getFieldType(show);
            } else {
                return FieldType.COLLEGE;
            }
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
         * @param {FormationDot} dot
         * @return {DotType}
         */
        getDotType(dot) {
            if (this.flow) {
                return this.flow.dots[dot.id].dotType;
            }
        },
        /**
         * @param {FormationDot} dot
         * @return {PixelCoordinate}
         */
        getPosition(dot) {
            if (isUndefined(this.$el)) {
                // component not mounted yet
                return new PixelCoordinate(0, 0);
            }

            let position = dot.position;
            if (this.flow) {
                let movements = this.flow.dots[dot.id].movements;
                if (movements.length > 0) {
                    // TODO: add beats
                    position = movements[0].getStart();
                }
            }

            return this.scale.toPixels(position);
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
