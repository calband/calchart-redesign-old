import { isNumber } from 'lodash';

import { PixelCoordinate, StepCoordinate } from 'calchart/Coordinate';

/**
 * An object containing dimension and scale information for a Grapher.
 */
export default class GrapherScale {
    /**
     * @param {number} fieldWidth - The width of the field type, in steps.
     * @param {number} fieldHeight - The height of the field type, in steps.
     * @param {number} svgWidth - The width of the svg, in pixels.
     * @param {number} svgHeight - The height of the svg, in pixels.
     * @param {Object} options - The options to customize drawing the field.
     *   - {number} fieldPadding - The minimum amount of space between the field
     *    and the edge, in pixels.
     *   - {boolean} eastUp - If true, orient the field to have the east side be
     *    the top edge.
     */
    constructor(fieldWidth, fieldHeight, svgWidth, svgHeight, options) {
        let aspectRatio = fieldWidth / fieldHeight;
        let width = Math.max(svgWidth - 2 * options.fieldPadding, 0);
        let height = Math.max(svgHeight - 2 * options.fieldPadding, 0);

        if (height * aspectRatio > width) {
            this._width = width;
            this._height = width / aspectRatio;
        } else {
            this._width = height * aspectRatio;
            this._height = height;
        }

        // pixels to the edges of the field
        this._minX = (svgWidth - this._width) / 2;
        this._maxX = this._minX + this._width;
        this._minY = (svgHeight - this._height) / 2;
        this._maxY = this._minY + this._height;

        // conversion ratio pixels per step; ratio same for x and y axes
        this._ratio = (this._maxX - this._minX) / fieldWidth;

        // true if east up
        this._eastUp = options.eastUp;
    }

    get width() { return this._width; }
    get height() { return this._height; }

    get minX() { return this._minX; }
    get maxX() { return this._maxX; }
    get minY() { return this._minY; }
    get maxY() { return this._maxY; }

    /**
     * Convert the input into pixels. If the input is a number, return the
     * scaled number of pixels for the given number of steps. If the input is a
     * Coordinate-like object, convert the coordinate from steps to pixels.
     *
     * @param {(number|StepCoordinate)} steps
     * @return {(number|PixelCoordinate)}
     */
    toPixels(steps) {
        if (isNumber(steps)) {
            return steps * this._ratio;
        } else {
            let x = this.toPixelsX(steps.x);
            let y = this.toPixelsY(steps.y);
            return new PixelCoordinate(x, y);
        }
    }

    /**
     * Convert the given x-coordinate from steps to pixels.
     *
     * @param {number} steps
     * @return {number}
     */
    toPixelsX(steps) {
        let pixels = this.toPixels(steps);
        if (this._eastUp) {
            return this.maxX - pixels;
        } else {
            return this.minX + pixels;
        }
    }

    /**
     * Convert the given y-coordinate from steps to pixels.
     *
     * @param {number} steps
     * @return {number}
     */
    toPixelsY(steps) {
        let pixels = this.toPixels(steps);
        if (this._eastUp) {
            return this.maxY - pixels;
        } else {
            return this.minY + pixels;
        }
    }

    /**
     * Convert the input into steps. If the input is a number, return the
     * number of steps for the given number of pixels. If the input is a
     * Coordinate-like object, convert the coordinate from pixels to steps.
     *
     * @param {(number|PixelCoordinate)} distance
     * @return {(number|StepCoordinate)}
     */
    toSteps(pixels) {
        if (isNumber(pixels)) {
            return pixels / this._ratio;
        } else {
            let x = this.toStepsX(pixels.x);
            let y = this.toStepsY(pixels.y);
            return new StepCoordinate(x, y);
        }
    }

    /**
     * Convert the given x-coordinate from pixels to steps.
     *
     * @param {number} pixels
     * @return {number}
     */
    toStepsX(pixels) {
        if (this._eastUp) {
            pixels = pixels + this.maxX;
        } else {
            pixels = pixels - this.minX;
        }
        return this.toSteps(pixels);
    }

    /**
     * Convert the given y-coordinate from pixels to steps.
     *
     * @param {number} pixels
     * @return {number}
     */
    toStepsY(pixels) {
        if (this._eastUp) {
            pixels = pixels + this.maxY;
        } else {
            pixels = pixels - this.minY;
        }
        return this.toSteps(pixels);
    }
}
