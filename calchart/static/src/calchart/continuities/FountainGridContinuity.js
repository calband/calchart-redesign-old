var BaseContinuity = require("./BaseContinuity");
var CalchartUtils = require("utils/CalchartUtils");
var HTMLBuilder = require("utils/HTMLBuilder");
var JSUtils = require("utils/JSUtils");
var MovementCommandMove = require("calchart/movements/MovementCommandMove");
var MovementCommandStop = require("calchart/movements/MovementCommandStop");

/**
 * An EWNS or NSEW continuity, where dots move as far EW or NS as possible,
 * then move NS or EW to get to their next position.
 *
 * @param {Sheet} sheet -- the sheet the continuity is for
 * @param {string} dotType -- the dot type the continuity is for
 * @param {boolean} isEWNS -- true if EWNS, otherwise NSEW
 * @param {object|undefined} options -- options for the continuity, including:
 *   - {string} end -- whether to marktime or close at the end
 *   - {string} step -- the step type to march, like high step, show high
 *   - {string} orientation -- the direction to face at the end
 *   - {int} beatsPerStep -- the number of beats per each step of the movement.
 *     (default 1)
 */
var FountainGridContinuity = function(sheet, dotType, isEWNS, options) {
    BaseContinuity.call(this, sheet, dotType);

    this._isEWNS = isEWNS;

    this._end = JSUtils.get(options, "end", "MT");
    this._stepType = JSUtils.get(options, "stepType", "default");
    this._orientation = JSUtils.get(options, "orientation", "default");
    this._beatsPerStep = JSUtils.get(options, "beatsPerStep", 1);
};

JSUtils.extends(FountainGridContinuity, BaseContinuity);

/**
 * Create a FountainGridContinuity from the given serialized data
 *
 * @param {Sheet} sheet -- the sheet the continuity is for
 * @param {string} dotType -- the dot type the continuity is for
 * @param {object} data -- the JSON data to initialize the
 *   FountainGridContinuity with
 * @return {FountainGridContinuity} the FountainGridContinuity reconstructed
 *   from the given data
 */
FountainGridContinuity.deserialize = function(sheet, dotType, data) {
    return new FountainGridContinuity(sheet, dotType, data.ewns, data);
};

/**
 * Return the JSONified version of the FountainGridContinuity
 *
 * @return {object} a JSON object containing this FountainGridContinuity's data
 */
FountainGridContinuity.prototype.serialize = function() {
    return {
        type: "FOUNTAIN",
        ewns: this._isEWNS,
        end: this._end,
        stepType: this._stepType,
        orientation: this._orientation,
        beatsPerStep: this._beatsPerStep,
    };
};

/**** INSTANCE METHODS ****/

FountainGridContinuity.prototype.getMovements = function(dot, data) {
    var start = data.position;
    var nextSheet = this._sheet.getNextSheet();
    var end = dot.getFirstPosition(nextSheet);

    var deltaX = end.x - start.x;
    var deltaY = end.y - start.y;
    var dirX = deltaX < 0 ? 90 : 270;
    var dirY = deltaY < 0 ? 180 : 0;

    var movements = [];
    var options = {
        beatsPerStep: this._beatsPerStep,
    };
    var addMovement = function(x, y, dir, duration) {
        var movement = new MovementCommandMove(x, y, dir, Math.abs(duration), options);
        movements.push(movement);
    };

    if (this._isEWNS) {
        if (deltaY !== 0) {
            addMovement(start.x, start.y, dirY, deltaY);
        }
        if (deltaX !== 0) {
            addMovement(start.x, end.y, dirX, deltaX);
        }
    } else {
        if (deltaX !== 0) {
            addMovement(start.x, start.y, dirX, deltaX);
        }
        if (deltaY !== 0) {
            addMovement(end.x, start.y, dirY, deltaY);
        }
    }

    var remaining = this._sheet.getDuration() - Math.abs(deltaX) - Math.abs(deltaY);
    if (remaining > 0) {
        var orientation = this.getOrientation();
        var marktime = this._end === "MT";
        var stop = new MovementCommandStop(end.x, end.y, orientation, remaining, marktime, options);
        movements.push(stop);
    }

    return movements;
};

/**
 * Get the final orientation for the final mark time, in Calchart degrees
 */
FountainGridContinuity.prototype.getOrientation = function() {
    // TODO: resolve default
    var orientation = this._orientation === "default" ? "east" : this._orientation;
    return orientation === "east" ? 0 : 90;
};

FountainGridContinuity.prototype.panelHTML = function(controller) {
    var _this = this;
    var type = this._isEWNS ? "EWNS" : "NSEW";

    var label = HTMLBuilder.span(type);

    var endLabel = HTMLBuilder.label("End:");
    var endChoices = HTMLBuilder.select({
        options: CalchartUtils.ENDINGS,
        change: function() {
            _this._end = $(this).val();
            _this._updateMovements(controller);
        },
        initial: this._end,
    });

    return this._wrapPanel(type, [label, endLabel, endChoices]);
};

FountainGridContinuity.prototype.popupHTML = function() {
    var end = HTMLBuilder.formfield("End", HTMLBuilder.select({
        options: CalchartUtils.ENDINGS,
        initial: this._end,
    }));

    var step = HTMLBuilder.formfield("Step Type", HTMLBuilder.select({
        options: CalchartUtils.STEP_TYPES,
        initial: this._stepType,
    }));

    var orientation = HTMLBuilder.formfield("Final Orientation", HTMLBuilder.select({
        options: CalchartUtils.ORIENTATIONS,
        initial: this._orientation,
    }), "orientation");

    var beatsPerStep = HTMLBuilder.formfield("Beats per Step", HTMLBuilder.input({
        type: "number",
        initial: this._beatsPerStep,
    }));

    return {
        name: this._isEWNS ? "EWNS" : "NSEW",
        fields: [end, step, orientation, beatsPerStep],
    };
};

module.exports = FountainGridContinuity;
