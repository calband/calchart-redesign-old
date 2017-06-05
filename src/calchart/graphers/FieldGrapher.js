import GrapherScale from "calchart/GrapherScale";

import { NotImplementedError } from "utils/errors";

/**
 * A FieldGrapher is responsible for drawing the field within a Grapher.
 */
export default class FieldGrapher {
    /**
     * @param {D3} svg - The SVG element to draw the field in.
     * @param {number} svgWidth - The width of the svg.
     * @param {number} svgHeight - The height of the svg.
     * @param {Object} options - The options to customize drawing the field.
     *   See Grapher.setOption for a list of all available options.
     */
    constructor(svg, svgWidth, svgHeight, options) {
        this._svg = svg;
        this._options = options;
        this._svgWidth = svgWidth;
        this._svgHeight = svgHeight;

        let paddingWidth = options.fieldPadding;
        let paddingHeight = options.fieldPadding;

        // expand field to a field and a half in each direction
        if (this._options.expandField) {
            paddingWidth += this._svgWidth * 1.5;
            paddingHeight += this._svgHeight * 1.5;
            this._svgWidth *= 4;
            this._svgHeight *= 4;
        }

        this._svg
            .attr("width", this._svgWidth)
            .attr("height", this._svgHeight);

        this._field = svg.select(".field");
        this._scale = new GrapherScale(this, this._svgWidth, this._svgHeight, paddingWidth, paddingHeight);
    }

    /**
     * @return {int} The height of the field, in steps.
     */
    static get FIELD_HEIGHT() {
        throw new NotImplementedError(this);
    }

    /**
     * @return {int} The width of the field, in steps.
     */
    static get FIELD_WIDTH() {
        throw new NotImplementedError(this);
    }

    // get dimensions of the SVG
    get FIELD_HEIGHT() { return this.constructor.FIELD_HEIGHT; }
    get FIELD_WIDTH() { return this.constructor.FIELD_WIDTH; }
    get svgWidth() { return this._svgWidth; }
    get svgHeight() { return this._svgHeight; }

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
