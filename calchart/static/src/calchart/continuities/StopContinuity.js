var BaseContinuity = require("./BaseContinuity");
var CalchartUtils = require("utils/CalchartUtils");
var HTMLBuilder = require("utils/HTMLBuilder");
var JSUtils = require("utils/JSUtils");
var MovementCommandMove = require("calchart/movements/MovementCommandMove");

/**
 * A continuity that does not move
 *
 * @param {Sheet} sheet -- the sheet the continuity is for
 * @param {string} dotType -- the dot type the continuity is for
 * @param {boolean} isClose -- true if close, false if mark time
 * @param {int|null} duration -- the number of beats to mark time or close; null
 *   use remaining beats
 */
var StopContinuity = function(sheet, dotType, isClose, duration) {
    BaseContinuity.call(this, sheet, dotType);

    this._close = isClose;
    this.duration = duration;
};

JSUtils.extends(StopContinuity, BaseContinuity);

/**
 * Create a StopContinuity from the given serialized data
 *
 * @param {Sheet} sheet -- the sheet the continuity is for
 * @param {string} dotType -- the dot type the continuity is for
 * @param {object} data -- the JSON data to initialize the
 *   StopContinuity with
 * @return {StopContinuity} the StopContinuity reconstructed
 *   from the given data
 */
StopContinuity.deserialize = function(sheet, dotType, data) {
    return new StopContinuity(sheet, dotType, data.isClose, data.duration);
};

/**
 * Return the JSONified version of the StopContinuity
 *
 * @return {object} a JSON object containing this StopContinuity's data
 */
StopContinuity.prototype.serialize = function() {
    return {
        type: "STOP",
        isClose: this._close,
        duration: this.duration,
    };
};

/**** INSTANCE METHODS ****/

StopContinuity.prototype.getMovements = function(dot, data) {
    // var move = new MovementCommandMove(
    //     start.x,
    //     start.y,
    //     CalchartUtils.STEP_SIZES.STANDARD,
    //     this._direction,
    //     this._direction,
    //     this._numSteps,
    //     1
    // );
    // return [move];
};

StopContinuity.prototype.panelHTML = function(controller) {
    // var _this = this;

    // var label = HTMLBuilder.span(null, "Move");

    // var steps = HTMLBuilder.input({
    //     class: "panel-continuity-duration",
    //     type: "number",
    //     initial: this._numSteps,
    //     change: function() {
    //         var duration = parseInt($(this).val());

    //         if (duration < 0) {
    //             $(this).val(0);
    //         } else {
    //             _this._numSteps = duration;
    //         }

    //         _this._updateMovements(controller);
    //     },
    // });

    // var direction = HTMLBuilder.select({
    //     options: CalchartUtils.DIRECTIONS,
    //     initial: this._direction,
    //     change: function() {
    //         _this._direction = $(this).val();
    //         _this._updateMovements(controller);
    //     },
    // });

    // var panel = this._wrapPanel("fm", [label, steps, direction]);

    // direction.dropdown({
    //     width: 50,
    // });

    // return panel;
};

StopContinuity.prototype.popupHTML = function() {
    // var steps = HTMLBuilder.formfield("Number of steps", HTMLBuilder.input({
    //     type: "number",
    //     initial: this._numSteps,
    // }), "steps");

    // var direction = HTMLBuilder.formfield("Direction", HTMLBuilder.select({
    //     options: CalchartUtils.DIRECTIONS,
    //     initial: this._direction,
    // }));

    // var stepType = HTMLBuilder.formfield("Step Type", HTMLBuilder.select({
    //     options: CalchartUtils.STEP_TYPES,
    //     initial: this._stepType,
    // }));

    // return {
    //     name: "Forward March",
    //     fields: [steps, direction, stepType],
    // };
};

StopContinuity.prototype.savePopup = function(data, $continuity) {
    // this._numSteps = data.steps;
    // this._direction = data.direction;
    // this._stepType = data.stepType;

    // $continuity.find("input").val(data.steps);
    // $continuity.find("select")
    //     .val(data.direction)
    //     .trigger("chosen:updated");
};

module.exports = StopContinuity;
