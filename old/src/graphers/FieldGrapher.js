import GrapherScale from "graphers/GrapherScale";

import { NotImplementedError } from "utils/errors";

/**
 * A FieldGrapher is responsible for drawing the field within a Grapher.
 */
export default class FieldGrapher {
    /**
     * @param {D3} field - The SVG element to draw the field in.
     * @param {number} svgWidth - The width of the svg.
     * @param {number} svgHeight - The height of the svg.
     * @param {Object} options - The options to customize drawing the field.
     *   See Grapher.setOption for a list of all available options.
     */
    constructor(field, svgWidth, svgHeight, options) {
        this._field = field;
        this._svgWidth = svgWidth;
        this._svgHeight = svgHeight;
        this._options = options;

        this._scale = new GrapherScale(this, this._svgWidth, this._svgHeight, options);
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

    get FIELD_HEIGHT() { return this.constructor.FIELD_HEIGHT; }
    get FIELD_WIDTH() { return this.constructor.FIELD_WIDTH; }

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
