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
 *   - {string} stepType -- only used for mark time
 *   - {int} beatsPerStep -- only used for mark time
 *   - {string} orientation -- the direction to face at the end
 */
var StopContinuity = function(sheet, dotType, isMarkTime, duration, options) {
    BaseContinuity.call(this, sheet, dotType, options);

    this._marktime = isMarkTime;
    this._duration = duration;
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
    return $.extend(BaseContinuity.prototype.serialize.call(this), {
        type: "STOP",
        isMarkTime: this._marktime,
        duration: this._duration,
    });
};

/**** INSTANCE METHODS ****/

StopContinuity.prototype.getMovements = function(dot, data) {
    if (this._marktime && this._duration !== null) {
        var duration = this._duration;
    } else {
        var duration = data.remaining;
    }
    var options = {
        beatsPerStep: this.getBeatsPerStep(),
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
    var fields = this._getPopupFields();

    if (!this._marktime) {
        return {
            name: "Close",
            fields: [fields.orientation],
        };
    } else if (this._duration === null) {
        return {
            name: "Mark Time Remaining",
            fields: [
                fields.orientation,
                fields.stepType,
                fields.beatsPerStep,
            ],
        };
    } else {
        return {
            name: "Mark Time",
            fields: [
                fields.duration,
                fields.orientation,
                fields.stepType,
                fields.beatsPerStep,
            ],
        };
    }
};

/**** HELPERS ****/

StopContinuity.prototype._getPopupFields = function() {
    var fields = BaseContinuity.prototype._getPopupFields.call(this);

    fields.duration = HTMLBuilder.formfield("Number of beats", HTMLBuilder.input({
        type: "number",
        initial: this._duration,
    }), "duration");

    return fields;
};

module.exports = StopContinuity;
