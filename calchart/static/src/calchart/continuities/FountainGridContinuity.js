var BaseContinuity = require("./BaseContinuity");
var HTMLBuilder = require("utils/HTMLBuilder");
var JSUtils = require("utils/JSUtils");

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

FountainGridContinuity.prototype.appendTo = function(continuities) {
    var type = this._isEWNS ? "EWNS" : "NSEW";

    var label = HTMLBuilder.span(null, type);

    var endLabel = HTMLBuilder.span(null, "End:");
    var endChoices = HTMLBuilder.select({
        options: {
            MT: "Mark Time",
            CL: "Close",
        },
        change: function() {
            // TODO: modify end
        },
    });
    var end = HTMLBuilder.div("panel-continuity-end", [endLabel, endChoices]);

    continuities.append(this._wrapHTML(type, [label, end]));
    endChoices.dropdown();
};

FountainGridContinuity.prototype.getMovements = function(sheet, dot) {
    // TODO
};

module.exports = FountainGridContinuity;
