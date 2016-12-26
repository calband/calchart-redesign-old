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
    return new FountainGridContinuity(isEWNS);
};

/**
 * Return the JSONified version of the FountainGridContinuity
 *
 * @return {object} a JSON object containing this FountainGridContinuity's data
 */
FountainGridContinuity.prototype.serialize = function() {
    return {
        type: this._isEWNS ? "EWNS" : "NSEW",
    };
};

/**** INSTANCE METHODS ****/

FountainGridContinuity.prototype.getMovements = function(sheet, dot, start) {
    var end = sheet.getNextSheet().getInfoForDot(dot.getLabel()).position;

    var deltaX = end.x - start.x;
    var deltaY = end.y - start.y;
    var dirX = deltaX < 0 ? 90 : deltaX > 0 ? 270 : -1;
    var dirY = deltaY < 0 ? 180 : deltaY > 0 ? 0 : -1;

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
    var addStop = function() {
        // TODO: customize marktime/close and orientation
        var movement = new MovementCommandStop(start.x, start.y, 0, sheet.getDuration(), true);
        movements.push(movement);
    };

    if (this._isEWNS) {
        if (dirY !== -1) {
            addMovement(start.x, start.y, dirY, deltaY);
        }
        if (dirX === -1) {
            addStop();
        } else {
            addMovement(start.x, end.y, dirX, deltaX);
        }
    } else {
        if (dirX !== -1) {
            addMovement(start.x, start.y, dirX, deltaX);
        }
        if (dirY === -1) {
            addStop();
        } else {
            addMovement(end.x, start.y, dirY, deltaY);
        }
    }

    return movements;
};

FountainGridContinuity.prototype.panelHTML = function() {
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
                // TODO: modify end
            },
        });
    var end = HTMLBuilder.div("panel-continuity-end", [endLabel, endChoices]);
    endChoices.dropdown({
        width: 110,
    });

    return this._wrapPanel(type, [label, end]);
};

FountainGridContinuity.prototype.popupHTML = function() {
    return {
        name: this._isEWNS ? "EWNS" : "NSEW",
        fields: [],
    };
};

module.exports = FountainGridContinuity;
