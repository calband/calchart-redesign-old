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
 * @param {Sheet} sheet -- the sheet the continuity is for
 * @param {string} dotType -- the dot type the continuity is for
 * @param {boolean} isEWNS -- true if EWNS, otherwise NSEW
 * @param {object|undefined} options -- options for the continuity, including:
 *   - {string} end -- whether to marktime or close at the end
 *   - {string} step -- the step type to march, like high step, show high
 *   - {string} orientation -- the direction to face at the end
 */
var FountainGridContinuity = function(sheet, dotType, isEWNS, options) {
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
 * @param {Sheet} sheet -- the sheet the continuity is for
 * @param {string} dotType -- the dot type the continuity is for
 * @param {object} data -- the JSON data to initialize the
 *   FountainGridContinuity with
 * @return {FountainGridContinuity} the FountainGridContinuity reconstructed
 *   from the given data
 */
FountainGridContinuity.deserialize = function(sheet, dotType, data) {
    return new FountainGridContinuity(sheet, dotType, data.ewns, data);
};

/**
 * Return the JSONified version of the FountainGridContinuity
 *
 * @return {object} a JSON object containing this FountainGridContinuity's data
 */
FountainGridContinuity.prototype.serialize = function() {
    return {
        type: "FOUNTAIN",
        ewns: this._isEWNS,
        end: this._end,
        step: this._step,
        orientation: this._orientation,
    };
};

/**** INSTANCE METHODS ****/

FountainGridContinuity.prototype.getMovements = function(dot, data) {
    var start = data.position;
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

FountainGridContinuity.prototype.panelHTML = function(controller) {
    var _this = this;
    var type = this._isEWNS ? "EWNS" : "NSEW";

    var label = HTMLBuilder.span(null, type);

    var endLabel = HTMLBuilder.span(null, "End:");
    var endChoices = HTMLBuilder.select({
        options: CalchartUtils.ENDINGS,
        change: function() {
            _this._end = $(this).val();
            _this._updateMovements(controller);
        },
        initial: this._end,
    });
    var end = HTMLBuilder.div("panel-continuity-end", [endLabel, endChoices]);
    endChoices.dropdown({
        width: 110,
    });

    return this._wrapPanel(type, [label, end]);
};

FountainGridContinuity.prototype.popupHTML = function() {
    var end = HTMLBuilder.formfield("End", HTMLBuilder.select({
        options: CalchartUtils.ENDINGS,
        initial: this._end,
    }));

    var step = HTMLBuilder.formfield("Step Type", HTMLBuilder.select({
        options: CalchartUtils.STEP_TYPES,
        initial: this._step,
    }));

    var orientation = HTMLBuilder.formfield("Final Orientation", HTMLBuilder.select({
        options: {
            default: "Default",
            east: "East",
            west: "West",
        },
        initial: this._orientation,
    }), "orientation");

    return {
        name: this._isEWNS ? "EWNS" : "NSEW",
        fields: [end, step, orientation],
    };
};

FountainGridContinuity.prototype.savePopup = function(data, $continuity) {
    this._end = data.end;
    this._step = data.step_type;
    this._orientation = data.orientation;

    $continuity.find("select")
        .val(data.end)
        .trigger("chosen:updated");
};

module.exports = FountainGridContinuity;
