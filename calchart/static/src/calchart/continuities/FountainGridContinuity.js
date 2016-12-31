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
 * @param {boolean} isEWNS -- true if EWNS, otherwise NSEW
 * @param {Sheet} sheet -- the sheet the continuity is for
 * @param {string} dotType -- the dot type the continuity is for
 * @param {object|undefined} options -- options for the continuity, including:
 *   - {string} end -- whether to marktime or close at the end
 *   - {string} step -- the step type to march, like high step, show high
 *   - {string} orientation -- the direction to face at the end
 */
var FountainGridContinuity = function(isEWNS, sheet, dotType, options) {
    BaseContinuity.call(this, sheet, dotType);

    this._isEWNS = isEWNS;

    options = options || {};
    this._end = options.end || "MT";
    this._step = options.step || "default";
    this._orientation = options.orientation || "default";
};

JSUtils.extends(FountainGridContinuity, BaseContinuity);

/**
 * Create a FountainGridContinuity from the given serialized data
 *
 * @param {boolean} isEWNS -- true if EWNS, otherwise NSEW
 * @param {Sheet} sheet -- the sheet the continuity is for
 * @param {string} dotType -- the dot type the continuity is for
 * @param {object} data -- the JSON data to initialize the
 *   FountainGridContinuity with
 * @return {FountainGridContinuity} the FountainGridContinuity reconstructed
 *   from the given data
 */
FountainGridContinuity.deserialize = function(isEWNS, sheet, dotType, data) {
    return new FountainGridContinuity(isEWNS, sheet, dotType, data);
};

/**
 * Return the JSONified version of the FountainGridContinuity
 *
 * @return {object} a JSON object containing this FountainGridContinuity's data
 */
FountainGridContinuity.prototype.serialize = function() {
    return {
        type: this._isEWNS ? "EWNS" : "NSEW",
        end: this._end,
        step: this._step,
        orientation: this._orientation,
    };
};

/**** INSTANCE METHODS ****/

FountainGridContinuity.prototype.getMovements = function(dot, start) {
    var end = this._sheet.getNextSheet().getInfoForDot(dot.getLabel()).position;

    var deltaX = end.x - start.x;
    var deltaY = end.y - start.y;
    var dirX = deltaX < 0 ? 90 : 270;
    var dirY = deltaY < 0 ? 180 : 0;

    var movements = [];
    var addMovement = function(x, y, dir, duration) {
        var movement = new MovementCommandMove(
            x,
            y,
            CalchartUtils.STEP_SIZES.STANDARD,
            dir,
            dir,
            Math.abs(duration),
            1
        );
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
        var orientation = this.getOrientation() === "east" ? 0 : 90;
        var marktime = this._end === "MT";
        var stop = new MovementCommandStop(end.x, end.y, orientation, remaining, marktime);
        movements.push(stop);
    }

    return movements;
};

/**
 * Get the final orientation for the final mark time, resolving default.
 */
FountainGridContinuity.prototype.getOrientation = function() {
    // TODO: resolve default
    return this._orientation === "default" ? "east" : this._orientation;
};

FountainGridContinuity.prototype.panelHTML = function() {
    var _this = this;
    var type = this._isEWNS ? "EWNS" : "NSEW";

    var label = HTMLBuilder.span(null, type);

    var endLabel = HTMLBuilder.span(null, "End:");
    var endChoices = HTMLBuilder
        .select({
            options: {
                MT: "Mark Time",
                CL: "Close",
            },
            change: function() {
                _this._end = $(this).val();
                _this._updateMovements();
            },
            selected: this._end,
        });
    var end = HTMLBuilder.div("panel-continuity-end", [endLabel, endChoices]);
    endChoices.dropdown({
        width: 110,
    });

    return this._wrapPanel(type, [label, end]);
};

FountainGridContinuity.prototype.popupHTML = function() {
    var end = HTMLBuilder.formfield("End", HTMLBuilder.select({
        options: {
            MT: "Mark Time",
            CL: "Close",
        },
        selected: this._end,
    }));
    var step = HTMLBuilder.formfield("Step Type", HTMLBuilder.select({
        options: {
            default: "Default",
            HS: "High Step",
            MM: "Mini Military",
            FF: "Full Field",
            SH: "Show High",
            JS: "Jerky Step",
        },
        selected: this._step,
    }));
    var orientation = HTMLBuilder.formfield("Final Orientation", HTMLBuilder.select({
        options: {
            default: "Default",
            east: "East",
            west: "West",
        },
        selected: this._orientation,
    }), "orientation");

    return {
        name: this._isEWNS ? "EWNS" : "NSEW",
        fields: [end, step, orientation],
    };
};

FountainGridContinuity.prototype.savePopup = function(data) {
    this._end = data.end;
    this._step = data.step_type;
    this._orientation = data.orientation;

    return function($continuity) {
        $continuity.find("select")
            .val(data.end)
            .trigger("chosen:updated");
    };
};

module.exports = FountainGridContinuity;
