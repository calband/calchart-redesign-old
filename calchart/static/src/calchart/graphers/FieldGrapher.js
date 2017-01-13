import * as d3 from "d3";
import * as _ from "lodash";

import GrapherScale from "calchart/GrapherScale";

import { NotImplementedError } from "utils/errors";

/**
 * A FieldGrapher is responsible for drawing the field within a Grapher.
 */
export default class FieldGrapher {
    /**
     * @param {D3} svg - The SVG element to draw the field in.
     * @param {Object} options - The options to customize drawing the field.
     *   @see Grapher#setOption.
     */
    constructor(svg, options) {
        this._svg = svg;
        this._svgWidth = svg.width();
        this._svgHeight = svg.height();
        this._options = options;

        this._field = svg.select(".field");

        let padding = _.defaultTo(options.fieldPadding, 30);
        this._scale = new GrapherScale(this, this._svgWidth, this._svgHeight, padding);
    }

    /**
     * @return {int} The height of the field, in steps.
     */
    get FIELD_HEIGHT() {
        throw new NotImplementedError(this);
    }

    /**
     * @return {int} The width of the field, in steps.
     */
    get FIELD_WIDTH() {
        throw new NotImplementedError(this);
    }

    /**
     * Draw the field.
     */
    drawField() {
        throw new NotImplementedError(this);
    }

    /**
     * @return {GrapherScale} The scale of the Grapher.
     */
    getScale() {
        return this._scale;
    }
}
