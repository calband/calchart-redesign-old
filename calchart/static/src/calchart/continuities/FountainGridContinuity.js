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
 */
var FountainGridContinuity = function(isEWNS) {
    this._isEWNS = isEWNS;

    this._end = "MT";
    this._step = "default";
    this._orientation = "default";
};

JSUtils.extends(FountainGridContinuity, BaseContinuity);

/**
 * Create a FountainGridContinuity from the given serialized data
 *
 * @param {object} data -- the JSON data to initialize the
 *   FountainGridContinuity with
 * @return {FountainGridContinuity} the FountainGridContinuity reconstructed
 *   from the given data
 */
FountainGridContinuity.deserialize = function(isEWNS, data) {
    var continuity = new FountainGridContinuity(isEWNS);
    continuity._end = data.end;
    continuity._step = data.step;
    continuity._orientation = data.orientation;
    return continuity;
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

FountainGridContinuity.prototype.getMovements = function(sheet, dot, start) {
    var end = sheet.getNextSheet().getInfoForDot(dot.getLabel()).position;

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

    var remaining = sheet.getDuration() - deltaX - deltaY;
    if (remaining > 0) {
        var orientation = this._orientation === "east" ? 0 : 90;
        var marktime = this._end === "MT";
        var stop = new MovementCommandStop(end.x, end.y, orientation, remaining, marktime);
        movements.push(stop);
    }

    return movements;
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
                var dotType = $(".panel.edit-continuity .dot-types li.active").data("dotType");
                window.controller.getActiveSheet().updateMovements(dotType);
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
