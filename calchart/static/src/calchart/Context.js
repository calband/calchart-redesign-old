var DefaultContext = require("./contexts/DefaultContext");

module.exports = {
    /**
     * Return an instance of BaseContext to load into the editor
     * application. Contexts available:
     *  - default: DefaultContext
     *
     * @param {string} name -- the name of the context to load
     * @param {Grapher} grapher -- the editor grapher
     * @return {BaseContext} the context that was loaded
     */
    load: function(name, grapher) {
        switch (name) {
            case "default":
                var context = new DefaultContext(grapher);
                break;
            default:
                throw new Error("No context named: " + name);
        }
        context.load();
        return context;
    },
};
