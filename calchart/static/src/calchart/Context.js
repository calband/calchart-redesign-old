var DefaultContext = require("./contexts/DefaultContext");

module.exports = {
    /**
     * Return an instance of BaseContext to load into the editor application
     *
     * @param {string} name -- the name of the context to load
     * @param {Grapher} grapher -- the editor grapher
     */
    load: function(name, grapher) {
        switch (name) {
            case "default":
                return new DefaultContext(grapher);
            default:
                throw new Error("No context named: " + name);
        }
    },
};
