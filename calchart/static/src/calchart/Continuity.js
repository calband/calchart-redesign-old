var FountainGridContinuity = require("./continuities/FountainGridContinuity");

/**
 * Return a subclass of BaseContinuity . We can do this in a constructor; source:
 * https://www.bennadel.com/blog/2522-providing-a-return-value-in-a-javascript-constructor.htm
 *
 * @param {string} type -- the type of Continuity to create (see partials/panel_edit_continuity.html)
 */
var Continuity = function(type) {
    switch (type) {
        case "EWNS":
            return new FountainGridContinuity(true);
            break;
        case "NSEW":
            return new FountainGridContinuity(false);
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
 * @param {object} data -- the JSON data to initialize the
 *   Continuity with
 * @return {BaseContinuity} the appropriate continuity
 */
Continuity.deserialize = function(data) {
    switch (data.type) {
        case "EWNS":
            return FountainGridContinuity.deserialize(true, data);
            break;
        case "NSEW":
            return FountainGridContinuity.deserialize(false, data);
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
