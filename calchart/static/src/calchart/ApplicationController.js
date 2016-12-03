var JSUtils = require("../utils/JSUtils");

/**
 * The abstract superclass that stores the current state of a Calchart application and
 * contains all of the actions that can be run in the application.
 *
 * @param {Show} show -- the show for the controller
 */
var ApplicationController = function(show) {
    this._show = show;
};

/**
 * Get the show stored in the controller
 *
 * @return {Show} the show stored in the controller
 */
ApplicationController.prototype.getShow = function() {
    return this._show;
};

/**
 * Sets up the given menu element.
 *
 * @param {jQuery|string} menu -- jQuery object or selector to setup
 */
ApplicationController.prototype._setupMenu = function(menu) {
    var _this = this;

    // maps keyboard shortcut to their function
    var shortcuts = {};

    // set up activating menu
    $(menu).children("li")
        .click(function() {
            $(menu).children("li.active").removeClass("active");

            if ($(menu).hasClass("active")) {
                $(menu).removeClass("active");
                return;
            }

            $(menu).addClass("active");
            $(this).addClass("active");

            // clicking off the menu will close the menu
            $(window).click(function(e) {
                var possibleMenu = $(e.target).closest(menu);
                // TODO: except .has-submenu
                if (possibleMenu.length === 0) {
                    $(menu).removeClass("active")
                        .children("li.active")
                        .removeClass("active");
                    $(this).off(e);
                }
            });
        })
        .mouseenter(function() {
            if ($(menu).hasClass("active")) {
                $(menu).children("li.active").removeClass("active");
                $(this).addClass("active");
            }
        });
        // TODO: functionality for hover over .has-submenu

    // set up click and add shortcuts to menu
    $(menu).find("li").each(function() {
        var _function = $(this).data("function");
        if (_function) {
            $(this).click(function() {
                _this.do(_function);
            });
            var shortcut = $(this).data("shortcut");
            if (shortcut) {
                shortcuts[shortcut] = _function;
            }
        }
    });

    // set up keyboard shortcuts
    $(window).keydown(function(e) {
        // convert keydown event into string
        var pressedKeys = [];
        if (e.metaKey || e.ctrlKey) {
            pressedKeys.push("ctrl");
        }
        if (e.altKey) {
            pressedKeys.push("alt");
        }
        if (e.shiftKey) {
            pressedKeys.push("shift");
        }
        var character = String.fromCharCode(e.keyCode).toLowerCase();
        pressedKeys.push(character);
        var _function = shortcuts[pressedKeys.join("+")];
        if (_function) {
            _this.do(_function);
            e.preventDefault();
        }
    });
};

/**
 * Sets up the given panel element
 *
 * @param {jQuery|string} panel -- jQuery object or panel to setup
 */
ApplicationController.prototype._setupPanel = function(panel) {
    var _this = this;

    // set up click
    $(panel).find("li").click(function() {
        var name = $(this).data("function");
        _this.do(name);
    });

    // TODO: set up help text
};

module.exports = ApplicationController;
