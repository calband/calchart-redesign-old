var BaseContinuity = require("./BaseContinuity");
var CalchartUtils = require("utils/CalchartUtils");
var HTMLBuilder = require("utils/HTMLBuilder");
var JSUtils = require("utils/JSUtils");
var MovementCommandEven = require("calchart/movements/MovementCommandEven");

/**
 * A continuity where dots use the rest of the time to go straight to
 * their next dot
 *
 * @param {Sheet} sheet -- the sheet the continuity is for
 * @param {string} dotType -- the dot type the continuity is for
 * @param {object|undefined} options -- options for the continuity, including:
 *   - {string} step -- the step type to march, like high step, show high
 *   - {string} orientation -- the direction to face while moving (only for
 *     military slides)
 *   - {int} beatsPerStep -- the number of beats per each step of the movement.
 *     (default 1)
 */
var EvenContinuity = function(sheet, dotType, options) {
    BaseContinuity.call(this, sheet, dotType);

    this._stepType = JSUtils.get(options, "step", "default");
    this._orientation = JSUtils.get(options, "orientation", "");
    this._beatsPerStep = JSUtils.get(options, "beatsPerStep", 1);
};

JSUtils.extends(EvenContinuity, BaseContinuity);

/**
 * Create a EvenContinuity from the given serialized data
 *
 * @param {Sheet} sheet -- the sheet the continuity is for
 * @param {string} dotType -- the dot type the continuity is for
 * @param {object} data -- the JSON data to initialize the
 *   EvenContinuity with
 * @return {EvenContinuity} the EvenContinuity reconstructed
 *   from the given data
 */
EvenContinuity.deserialize = function(sheet, dotType, data) {
    return new EvenContinuity(sheet, dotType, data);
};

/**
 * Return the JSONified version of the EvenContinuity
 *
 * @return {object} a JSON object containing this EvenContinuity's data
 */
EvenContinuity.prototype.serialize = function() {
    return {
        type: "EVEN",
        step: this._stepType,
        orientation: this._orientation,
        beatsPerStep: this._beatsPerStep,
    };
};

/**** INSTANCE METHODS ****/

EvenContinuity.prototype.getMovements = function(dot, data) {
    var nextSheet = this._sheet.getNextSheet();
    var end = dot.getFirstPosition(nextSheet);
    var options = {
        orientation: this.getOrientation(),
        beatsPerStep: this._beatsPerStep,
    };

    var move = new MovementCommandEven(
        data.position.x,
        data.position.y,
        end.x,
        end.y,
        data.remaining,
        options
    );
    return [move];
};

/**
 * Get the orientation for the movement, in Calchart degrees
 */
EvenContinuity.prototype.getOrientation = function() {
    switch (this._orientation) {
        case "":
            // face direction of motion
            return undefined;
        case "east":
            return 0;
        case "west":
            return 90;
        default:
            throw new Error("Invalid orientation: " + this._orientation);
    }
};

EvenContinuity.prototype.panelHTML = function(controller) {
    var _this = this;

    var label = HTMLBuilder.span("Even");

    return this._wrapPanel("even", [label]);
};

EvenContinuity.prototype.popupHTML = function() {
    var stepType = HTMLBuilder.formfield("Step Type", HTMLBuilder.select({
        options: CalchartUtils.STEP_TYPES,
        initial: this._stepType,
    }));

    var orientation = HTMLBuilder.formfield("Orientation", HTMLBuilder.select({
        options: {
            "": "Direction of Travel",
            "east": "East",
            "west": "West",
        },
        initial: this._orientation,
    }));

    var beatsPerStep = HTMLBuilder.formfield("Beats per Step", HTMLBuilder.input({
        type: "number",
        initial: this._beatsPerStep,
    }));

    return {
        name: "Even",
        fields: [stepType, orientation, beatsPerStep],
    };
};

module.exports = EvenContinuity;
