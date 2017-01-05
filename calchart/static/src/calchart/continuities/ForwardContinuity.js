var BaseContinuity = require("./BaseContinuity");
var CalchartUtils = require("utils/CalchartUtils");
var HTMLBuilder = require("utils/HTMLBuilder");
var JSUtils = require("utils/JSUtils");
var MovementCommandMove = require("calchart/movements/MovementCommandMove");

/**
 * A simple forward march continuity, taking the given number
 * of steps in a given direction
 *
 * @param {Sheet} sheet -- the sheet the continuity is for
 * @param {string} dotType -- the dot type the continuity is for
 * @param {int} steps -- the number of steps
 * @param {int} direction -- the direction to march, in Calchart degrees
 * @param {object|undefined} options -- options for the continuity, including:
 *   - {string} stepType -- the step type to march, like high step, show high
 *   - {int} beatsPerStep -- the number of beats per each step of the movement.
 *     (default 1)
 */
var ForwardContinuity = function(sheet, dotType, steps, direction, options) {
    BaseContinuity.call(this, sheet, dotType);

    this._numSteps = steps;
    this._direction = direction;

    this._stepType = JSUtils.get(options, "stepType", "default");
    this._beatsPerStep = JSUtils.get(options, "beatsPerStep", 1);
};

JSUtils.extends(ForwardContinuity, BaseContinuity);

/**
 * Create a ForwardContinuity from the given serialized data
 *
 * @param {Sheet} sheet -- the sheet the continuity is for
 * @param {string} dotType -- the dot type the continuity is for
 * @param {object} data -- the JSON data to initialize the
 *   ForwardContinuity with
 * @return {ForwardContinuity} the ForwardContinuity reconstructed
 *   from the given data
 */
ForwardContinuity.deserialize = function(sheet, dotType, data) {
    return new ForwardContinuity(sheet, dotType, data.steps, data.direction, data);
};

/**
 * Return the JSONified version of the ForwardContinuity
 *
 * @return {object} a JSON object containing this ForwardContinuity's data
 */
ForwardContinuity.prototype.serialize = function() {
    return {
        type: "FORWARD",
        steps: this._numSteps,
        direction: this._direction,
        stepType: this._stepType,
        beatsPerStep: this._beatsPerStep,
    };
};

/**** INSTANCE METHODS ****/

ForwardContinuity.prototype.getMovements = function(dot, data) {
    var move = new MovementCommandMove(
        data.position.x,
        data.position.y,
        this._direction,
        this._numSteps * this._beatsPerStep,
        {
            beatsPerStep: this._beatsPerStep,
        }
    );
    return [move];
};

ForwardContinuity.prototype.panelHTML = function(controller) {
    var _this = this;

    var label = HTMLBuilder.span("Move");

    var steps = HTMLBuilder.input({
        class: "panel-continuity-duration",
        type: "number",
        initial: this._numSteps,
        change: function() {
            _this._numSteps = JSUtils.validatePositive(this);
            _this._updateMovements(controller);
        },
    });

    var direction = HTMLBuilder.select({
        options: CalchartUtils.DIRECTIONS,
        initial: this._direction,
        change: function() {
            _this._direction = $(this).val();
            _this._updateMovements(controller);
        },
    });

    return this._wrapPanel("fm", [label, steps, direction]);
};

ForwardContinuity.prototype.popupHTML = function() {
    var steps = HTMLBuilder.formfield("Number of steps", HTMLBuilder.input({
        type: "number",
        initial: this._numSteps,
    }), "numSteps");

    var direction = HTMLBuilder.formfield("Direction", HTMLBuilder.select({
        options: CalchartUtils.DIRECTIONS,
        initial: this._direction,
    }));

    var stepType = HTMLBuilder.formfield("Step Type", HTMLBuilder.select({
        options: CalchartUtils.STEP_TYPES,
        initial: this._stepType,
    }));

    var beatsPerStep = HTMLBuilder.formfield("Beats per Step", HTMLBuilder.input({
        type: "number",
        initial: this._beatsPerStep,
    }));

    return {
        name: "Forward March",
        fields: [steps, direction, stepType, beatsPerStep],
    };
};

module.exports = ForwardContinuity;
