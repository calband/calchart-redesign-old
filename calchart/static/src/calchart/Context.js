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
     * @param {EditorController} controller -- the editor controller
     * @param {object|undefined} options -- any options to pass to .load()
     * @return {BaseContext} the context that was loaded
     */
    load: function(name, controller, options) {
        switch (name) {
            case "continuity":
                var context = new ContinuityContext(controller);
                break;
            case "dot":
                var context = new DotContext(controller);
                break;
            default:
                throw new Error("No context named: " + name);
        }
        context.load(options);
        return context;
    },
};
