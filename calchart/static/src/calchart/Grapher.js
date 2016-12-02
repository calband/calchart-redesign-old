var CollegeGrapher = require("./graphers/CollegeGrapher");

/**
 * Return a subclass of BaseGrapher to use to graph the field. We can do this in a
 * constructor. Source:
 * https://www.bennadel.com/blog/2522-providing-a-return-value-in-a-javascript-constructor.htm
 */
module.exports = function(show, drawTarget) {
    var fieldType = show.getFieldType();
    switch (fieldType) {
        case "college":
            return new CollegeGrapher(show, drawTarget);
        default:
            throw new Error("No Grapher for the type: " + fieldType);
    }
};
