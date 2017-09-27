/**
 * A loader for injecting a <context-menu> section into a Vue component. See:
 * https://vue-loader.vuejs.org/en/configurations/custom-blocks.html#runtime-available-docs
 *
 * A component can only have one context menu. The context menu is added to the
 * template and can be opened with `this.contextMenu.open(event)`.
 */
function getContextMenuLoader(source) {
    var _cmLoader = function(Component) {
        var mixin = {
            created: function() {
                this.contextMenu = {
                    open: e => {
                        this._cmHide = false;
                    },
                    hide: () => {
                        this._cmHide = true;
                    },
                };
            },
            data: function() {
                return {
                    _cmHide: true,
                };
            },
            // template: "<ul v-if='_cmHide'>__TEMPLATE__</ul>",
        };

        Component.options.mixins = [mixin].concat(Component.options.mixins || []);
    };

    var template = source.replace(/\n/g, "").replace(/"/g, "\\\"");
    return _cmLoader.toString().replace("__TEMPLATE__", template);
}

module.exports = function(source, map) {
    this.callback(null, "module.exports =" + getContextMenuLoader.call(this, source), map);
};
