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
 *   - {string} stepType
 *   - {int} beatsPerStep
 */
var ForwardContinuity = function(sheet, dotType, steps, direction, options) {
    BaseContinuity.call(this, sheet, dotType, options);

    this._numSteps = steps;
    this._direction = direction;
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
    return $.extend(BaseContinuity.prototype.serialize.call(this), {
        type: "FORWARD",
        steps: this._numSteps,
        direction: this._direction,
    });
};

/**** INSTANCE METHODS ****/

ForwardContinuity.prototype.getMovements = function(dot, data) {
    var options = {
        beatsPerStep: this.getBeatsPerStep(),
    };
    var move = new MovementCommandMove(
        data.position.x,
        data.position.y,
        this._direction,
        this._numSteps * options.beatsPerStep,
        options
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
    var fields = this._getPopupFields();

    return {
        name: "Forward March",
        fields: [
            fields.steps,
            fields.direction,
            fields.stepType,
            fields.beatsPerStep,
        ],
    };
};

/**** HELPERS ****/

ForwardContinuity.prototype._getPopupFields = function() {
    var fields = BaseContinuity.prototype._getPopupFields.call(this);

    fields.steps = HTMLBuilder.formfield("Number of steps", HTMLBuilder.input({
        type: "number",
        initial: this._numSteps,
    }), "numSteps");

    fields.direction = HTMLBuilder.formfield("Direction", HTMLBuilder.select({
        options: CalchartUtils.DIRECTIONS,
        initial: this._direction,
    }));

    delete fields.orientation;

    return fields;
};

module.exports = ForwardContinuity;
