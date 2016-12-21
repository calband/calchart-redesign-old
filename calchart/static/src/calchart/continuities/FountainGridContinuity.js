var BaseContinuity = require("./BaseContinuity");
var JSUtils = require("../../utils/JSUtils");

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

FountainGridContinuity.prototype.getMovements = function(sheet, dot) {
    // TODO
};

FountainGridContinuity.prototype.html = function() {
    var type = this._isEWNS ? "EWNS" : "NSEW";

    var contents = $("<span>").text(type);
    // TODO: end (default mark time)

    return this._wrapHTML(type, contents);
};

module.exports = FountainGridContinuity;
