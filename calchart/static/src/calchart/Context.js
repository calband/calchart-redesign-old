var CONTEXTS = {
    editor: require("./contexts/EditorContexts"),
};

module.exports = {
    /**
     * Return an instance of a subclass of BaseContext. We can do this in a constructor; source:
     * https://www.bennadel.com/blog/2522-providing-a-return-value-in-a-javascript-constructor.htm
     *
     * @param {string} name -- the name of the context to load of the format "<app>:<name>", e.g.
     *   "editor:default"
     */
    load: function(name) {
        name = name.split(":");
        var Context = CONTEXTS[name[0]][name[1]];
        return new Context();
    },
};
