var FountainGridContinuity = require("./continuities/FountainGridContinuity");

/**
 * Return a subclass of BaseContinuity . We can do this in a constructor; source:
 * https://www.bennadel.com/blog/2522-providing-a-return-value-in-a-javascript-constructor.htm
 *
 * @param {Sheet} sheet -- the sheet the continuity is for
 * @param {string} type -- the type of Continuity to create (see partials/panel_edit_continuity.html)
 */
var Continuity = function(sheet, type) {
    switch (type) {
        case "EWNS":
            return new FountainGridContinuity(true, sheet);
            break;
        case "NSEW":
            return new FountainGridContinuity(false, sheet);
            break;
        case "FM":
            return null;
            break;
        case "MT":
            return null;
            break;
        case "MTRM":
            return null;
            break;
        default:
            throw new Error("No continuity of the type: " + type);
    }
};

/**
 * Routes the deserialization to the appropriate Continuity
 *
 * @param {Sheet} sheet -- the sheet the continuity is for
 * @param {object} data -- the JSON data to initialize the
 *   Continuity with
 * @return {BaseContinuity} the appropriate continuity
 */
Continuity.deserialize = function(sheet, data) {
    switch (data.type) {
        case "EWNS":
            return FountainGridContinuity.deserialize(true, sheet, data);
            break;
        case "NSEW":
            return FountainGridContinuity.deserialize(false, sheet, data);
            break;
        case "FM":
            return null;
            break;
        case "MT":
            return null;
            break;
        case "MTRM":
            return null;
            break;
        default:
            throw new Error("No continuity of the type: " + type);
    }
};

module.exports = Continuity;
