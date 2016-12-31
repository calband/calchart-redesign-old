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
 *   - TODO
 */
var ForwardContinuity = function(sheet, dotType, steps, direction, options) {
    BaseContinuity.call(this, sheet, dotType);

    this._numSteps = steps;
    this._direction = direction;

    options = options || {};
    // TODO
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
        type: "FM",
        steps: this._numSteps,
        direction: this._direction,
        // TODO
    };
};

/**** INSTANCE METHODS ****/

ForwardContinuity.prototype.getMovements = function(dot, start) {
    var move = new MovementCommandMove(
        start.x,
        start.y,
        CalchartUtils.STEP_SIZES.STANDARD,
        this._direction,
        this._direction,
        this._numSteps,
        1
    );
    return [move];
};

ForwardContinuity.prototype.panelHTML = function() {
    var _this = this;

    var label = HTMLBuilder.span(null, "Move");

    var steps = HTMLBuilder.input({
        class: "panel-continuity-duration",
        type: "number",
        initial: this._numSteps,
        change: function() {
            var duration = parseInt($(this).val());

            if (duration < 0) {
                $(this).val(0);
            } else {
                _this._numSteps = duration;
            }

            _this._updateMovements();
        },
    });

    var direction = HTMLBuilder.select({
        options: {
            0: "E",
            90: "S",
            180: "W",
            270: "N",
        },
        selected: this._direction,
        change: function() {
            _this._direction = $(this).val();
            _this._updateMovements();
        },
    });

    var panel = this._wrapPanel("fm", [label, steps, direction]);

    direction.dropdown({
        width: 50,
    });

    return panel;
};

ForwardContinuity.prototype.popupHTML = function() {
    // var end = HTMLBuilder.formfield("End", HTMLBuilder.select({
    //     options: {
    //         MT: "Mark Time",
    //         CL: "Close",
    //     },
    //     selected: this._end,
    // }));
    // var step = HTMLBuilder.formfield("Step Type", HTMLBuilder.select({
    //     options: {
    //         default: "Default",
    //         HS: "High Step",
    //         MM: "Mini Military",
    //         FF: "Full Field",
    //         SH: "Show High",
    //         JS: "Jerky Step",
    //     },
    //     selected: this._step,
    // }));
    // var orientation = HTMLBuilder.formfield("Final Orientation", HTMLBuilder.select({
    //     options: {
    //         default: "Default",
    //         east: "East",
    //         west: "West",
    //     },
    //     selected: this._orientation,
    // }), "orientation");

    return {
        name: "Forward March",
        // fields: [end, step, orientation],
    };
};

ForwardContinuity.prototype.savePopup = function(data) {
    // this._end = data.end;
    // this._step = data.step_type;
    // this._orientation = data.orientation;

    // return function($continuity) {
    //     $continuity.find("select")
    //         .val(data.end)
    //         .trigger("chosen:updated");
    // };
};

module.exports = ForwardContinuity;
