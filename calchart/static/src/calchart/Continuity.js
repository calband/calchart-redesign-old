var FountainGridContinuity = require("./continuities/FountainGridContinuity");
var ForwardContinuity = require("./continuities/ForwardContinuity");
var StopContinuity = require("./continuities/StopContinuity");

/**
 * Return a subclass of BaseContinuity . We can do this in a constructor; source:
 * https://www.bennadel.com/blog/2522-providing-a-return-value-in-a-javascript-constructor.htm
 *
 * @param {string} type -- the type of Continuity to create (see partials/panel_edit_continuity.html)
 * @param {Sheet} sheet -- the sheet the continuity is for
 * @param {string} dotType -- the dot type the continuity is for
 */
var Continuity = function(type, sheet, dotType) {
    switch (type) {
        case "EWNS":
            return new FountainGridContinuity(true, sheet, dotType);
        case "NSEW":
            return new FountainGridContinuity(false, sheet, dotType);
        case "FM":
            return new ForwardContinuity(sheet, dotType, 0, 0);
        case "MT":
            return new StopContinuity(sheet, dotType, true, 0);
        case "MTRM":
            return new StopContinuity(sheet, dotType, true, null);
        case "CL":
            return new StopContinuity(sheet, dotType, false, null);
        default:
            throw new Error("No continuity of the type: " + type);
    }
};

/**
 * Routes the deserialization to the appropriate Continuity
 *
 * @param {Sheet} sheet -- the sheet the continuity is for
 * @param {string} dotType -- the dot type the continuity is for
 * @param {object} data -- the JSON data to initialize the
 *   Continuity with
 * @return {BaseContinuity} the appropriate continuity
 */
Continuity.deserialize = function(sheet, dotType, data) {
    switch (data.type) {
        case "EWNS":
            return FountainGridContinuity.deserialize(true, sheet, dotType, data);
        case "NSEW":
            return FountainGridContinuity.deserialize(false, sheet, dotType, data);
        case "FM":
            return ForwardContinuity.deserialize(sheet, dotType, data);
        case "STOP":
            return StopContinuity.deserialize(sheet, dotType, data);
        default:
            throw new Error("No continuity of the type: " + data.type);
    }
};

module.exports = Continuity;
