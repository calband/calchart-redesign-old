var CollegeGrapher = require("./graphers/CollegeGrapher");

/**
 * Return a subclass of BaseGrapher to use to graph the field. We can do this in a
 * constructor; source:
 * https://www.bennadel.com/blog/2522-providing-a-return-value-in-a-javascript-constructor.htm
 */
var Grapher = function(show, drawTarget, options) {
    var fieldType = show.getFieldType();
    switch (fieldType) {
        case "college":
            return new CollegeGrapher(show, drawTarget, options);
        default:
            throw new Error("No Grapher for the type: " + fieldType);
    }
};

module.exports = Grapher;
