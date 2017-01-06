var BaseContinuity = require("./BaseContinuity");
var CalchartUtils = require("utils/CalchartUtils");
var HTMLBuilder = require("utils/HTMLBuilder");
var JSUtils = require("utils/JSUtils");
var MovementCommandEven = require("calchart/movements/MovementCommandEven");

/**
 * A continuity where dots use the rest of the time to go straight to
 * their next dot
 *
 * @param {Sheet} sheet
 * @param {string} dotType
 * @param {object|undefined} options -- options for the continuity, including:
 *   - {string} stepType
 *   - {int} beatsPerStep
 *   - {string} orientation -- the direction to face while moving (only for
 *     military slides). Can also be the empty string to denote moving in the
 *     same direction
 */
var EvenContinuity = function(sheet, dotType, options) {
    BaseContinuity.call(this, sheet, dotType, options);
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
    return $.extend(BaseContinuity.prototype.serialize.call(this), {
        type: "EVEN",
    });
};

/**** INSTANCE METHODS ****/

EvenContinuity.prototype.getMovements = function(dot, data) {
    var nextSheet = this._sheet.getNextSheet();
    var end = dot.getFirstPosition(nextSheet);
    var options = {
        orientation: this.getOrientation(),
        beatsPerStep: this.getBeatsPerStep(),
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
            "default": "Facing Default",
            "east": "Facing East",
            "west": "Facing West",
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
