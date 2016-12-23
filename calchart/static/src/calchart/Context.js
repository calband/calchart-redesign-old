var ContinuityContext = require("./contexts/ContinuityContext");
var DotContext = require("./contexts/DotContext");

module.exports = {
    /**
     * Return an instance of BaseContext to load into the editor
     * application. Contexts available:
     *  - dot: DotContext
     *  - continuity: ContinuityContext
     *
     * @param {string} name -- the name of the context to load
     * @param {BaseGrapher} grapher -- the editor grapher
     * @param {Sheet} sheet -- the currently active sheet
     * @return {BaseContext} the context that was loaded
     */
    load: function(name, grapher, sheet) {
        switch (name) {
            case "continuity":
                var context = new ContinuityContext(grapher, sheet);
                break;
            case "dot":
                var context = new DotContext(grapher, sheet);
                break;
            default:
                throw new Error("No context named: " + name);
        }
        context.load();
        return context;
    },
};
