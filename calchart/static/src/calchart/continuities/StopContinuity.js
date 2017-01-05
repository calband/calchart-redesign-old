var BaseContinuity = require("./BaseContinuity");
var CalchartUtils = require("utils/CalchartUtils");
var HTMLBuilder = require("utils/HTMLBuilder");
var JSUtils = require("utils/JSUtils");
var MovementCommandStop = require("calchart/movements/MovementCommandStop");

/**
 * A continuity that does not move
 *
 * @param {Sheet} sheet -- the sheet the continuity is for
 * @param {string} dotType -- the dot type the continuity is for
 * @param {boolean} isMarkTime -- true if mark time, false if close
 * @param {int|null} duration -- the number of beats to mark time or close; null
 *   use remaining beats
 * @param {object|undefined} options -- options for the continuity, including:
 *   - {string} step -- the step type to march, like high step, show high
 *   - {string} orientation -- the direction to face at the end
 *   - {int} beatsPerStep -- the number of beats per each step of the movement.
 *     (default 1)
 */
var StopContinuity = function(sheet, dotType, isMarkTime, duration, options) {
    BaseContinuity.call(this, sheet, dotType);

    this._marktime = isMarkTime;
    this._duration = duration;

    this._stepType = JSUtils.get(options, "step", "default");
    this._orientation = JSUtils.get(options, "orientation", "default");
    this._beatsPerStep = JSUtils.get(options, "beatsPerStep", 1);
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
    return new StopContinuity(sheet, dotType, data.isMarkTime, data.duration, data);
};

/**
 * Return the JSONified version of the StopContinuity
 *
 * @return {object} a JSON object containing this StopContinuity's data
 */
StopContinuity.prototype.serialize = function() {
    return {
        type: "STOP",
        isMarkTime: this._marktime,
        duration: this._duration,
        step: this._stepType,
        orientation: this._orientation,
        beatsPerStep: this._beatsPerStep,
    };
};

/**** INSTANCE METHODS ****/

StopContinuity.prototype.getMovements = function(dot, data) {
    if (this._marktime && this._duration !== null) {
        var duration = this._duration;
    } else {
        var duration = data.remaining;
    }
    var options = {
        beatsPerStep: this._beatsPerStep,
    };

    var move = new MovementCommandStop(
        data.position.x,
        data.position.y,
        this.getOrientation(),
        duration,
        this._marktime,
        options
    );

    return [move];
};

/**
 * Get the orientation for the movement, in Calchart degrees
 */
StopContinuity.prototype.getOrientation = function() {
    // TODO: resolve default
    var orientation = this._orientation === "default" ? "east" : this._orientation;
    return orientation === "east" ? 0 : 90;
};

StopContinuity.prototype.panelHTML = function(controller) {
    var _this = this;

    if (!this._marktime) {
        // close
        var label = HTMLBuilder.span("Close");
        return this._wrapPanel("close", [label]);
    } else if (this._duration === null) {
        // mark time remaining
        var label = HTMLBuilder.span("MTRM");

        var orientation = HTMLBuilder.select({
            options: CalchartUtils.ORIENTATIONS,
            change: function() {
                _this._orientation = $(this).val();
                _this._updateMovements(controller);
            },
            initial: this._orientation,
        });

        return this._wrapPanel("mtrm", [label, orientation]);
    } else {
        // mark time for a duration
        var label = HTMLBuilder.span("MT");

        var durationLabel = HTMLBuilder.span("Beats:");
        var duration = HTMLBuilder.input({
            class: "panel-continuity-duration",
            type: "number",
            initial: this._duration,
            change: function() {
                _this._duration = JSUtils.validatePositive(this);
                _this._updateMovements(controller);
            },
        });

        return this._wrapPanel("mt", [label, durationLabel, duration]);
    }
};

StopContinuity.prototype.popupHTML = function() {
    var orientation = HTMLBuilder.formfield("Orientation", HTMLBuilder.select({
        options: CalchartUtils.ORIENTATIONS,
        initial: this._orientation,
    }));

    if (!this._marktime) {
        return {
            name: "Close",
            fields: [orientation],
        };
    }

    var duration = HTMLBuilder.formfield("Number of beats", HTMLBuilder.input({
        type: "number",
        initial: this._duration,
    }), "duration");

    var stepType = HTMLBuilder.formfield("Step Type", HTMLBuilder.select({
        options: CalchartUtils.STEP_TYPES,
        initial: this._stepType,
    }));

    var beatsPerStep = HTMLBuilder.formfield("Beats per Step", HTMLBuilder.input({
        type: "number",
        initial: this._beatsPerStep,
    }));

    var fields = [duration, orientation, stepType, beatsPerStep];

    if (this._duration === null) {
        fields.splice(0, 1);
    }

    return {
        name: this._duration === null ? "Mark Time Remaining" : "Mark Time",
        fields: fields,
    };
};

module.exports = StopContinuity;
