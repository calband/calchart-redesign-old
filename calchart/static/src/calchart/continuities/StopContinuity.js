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
 */
var StopContinuity = function(sheet, dotType, isMarkTime, duration, options) {
    BaseContinuity.call(this, sheet, dotType);

    this._marktime = isMarkTime;
    this._duration = duration;

    options = options || {};
    this._stepType = options.step || "default";
    this._orientation = options.orientation || "default";
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
        step: this._step,
        orientation: this._orientation,
    };
};

/**** INSTANCE METHODS ****/

StopContinuity.prototype.getMovements = function(dot, data) {
    if (this._marktime) {
        var duration = this._duration;
    } else {
        var duration = data.remaining;
    }
    var move = new MovementCommandStop(
        data.position.x,
        data.position.y,
        this._orientation,
        duration,
        this._marktime
    );
    return [move];
};

StopContinuity.prototype.panelHTML = function(controller) {
    var _this = this;

    if (!this._marktime) {
        var label = HTMLBuilder.span(null, "Close");
        return this._wrapPanel("close", [label]);
    }

    var label = HTMLBuilder.span(null, "MT");

    var duration = HTMLBuilder.input({
        class: "panel-continuity-duration",
        type: "number",
        initial: this._duration,
        change: function() {
            _this._duration = JSUtils.validatePositive(this);
            _this._updateMovements(controller);
        },
    });

    var panel = this._wrapPanel("mt", [label, duration]);

    return panel;
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

    return {
        name: "Mark Time",
        fields: [duration, orientation, stepType],
    };
};

StopContinuity.prototype.savePopup = function(data, $continuity) {
    this._orientation = data.orientation;

    if (this._marktime) {
        this._duration = data.duration;
        this._stepType = data.stepType;
        $continuity.find("input").val(data.duration);
    }
};

module.exports = StopContinuity;
