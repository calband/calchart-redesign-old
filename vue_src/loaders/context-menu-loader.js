var compiler = require("vue-template-compiler");

/**
 * A loader for injecting a <context-menu> section into a Vue component.
 * See utils/ContextMenu.vue.
 */
function getContextMenuLoader(source) {
    // Note: this function will be converted into a string and used directly in the
    // generated JS file. Use ES5.
    var _cmLoader = function(Component) {
        var mixin = {
            created: function() {
                this.contextMenu = null;
            },
            mounted: function() {
                this.contextMenu = this.$children.find(function(child) {
                    return child.$options.name === "ContextMenu";
                });
            },
        };

        Component.options.mixins = [mixin].concat(Component.options.mixins || []);

        var oldRender = Component.options.render;
        Component.options.render = function(createElement) {
            function getContents() {
                // RENDER CODE
            }
            var contents = getContents.call(this);
            return createElement("div", [
                createElement("context-menu", contents.children),
                oldRender.call(this, createElement),
            ]);
        };
    };

    var renderCode = compiler.compile("<ul>" + source + "</ul>");
    return _cmLoader.toString().replace("// RENDER CODE", renderCode.render);
}

module.exports = function(source, map) {
    this.callback(null, "module.exports =" + getContextMenuLoader.call(this, source), map);
};
