/**
 * @fileOverview Defines the base Panel class that can be subclassed by a page-specific panel.
 */

/**
 * A collection of panel actions for a subclassing Panel object.
 */
var Panel = {};

/**
 * Sets up a panel on the page, binding all of the panel items to their actions. Requires the
 * panel to have the class `panel` (the only element on the page with the class).
 *
 * @param {object} actions -- an object mapping the name of the action to the function to call when
 *   the panel item is clicked.
 */
Panel.setup = function(actions) {
    var _this = this;

    // set up click
    $(".panel li").click(function() {
        var _function = actions[$(this).data("function")];
        if (_function) {
            _function();
        }
    });
};

module.exports = Panel;
