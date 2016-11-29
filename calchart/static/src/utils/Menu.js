/**
 * @fileOverview Defines the base Menu class that can be subclassed by a page-specific menu.
 */

/**
 * A collection of menu actions for a subclassing Menu object.
 */
var Menu = {};

/**
 * Sets up a menu on the page, binding all of the keyboard shortcuts and menu actions.
 * Requires the menu to have the class `menu` (the only element on the page with the
 * class). Sets up the following:
 *
 *  - Clicking on the first level of menu items will add the `active` class to the menu.
 *  - Clicking on any menu item with `data-function` defined will run the function
 *      with that name defined in this Menu object.
 *  - If a menu item has `data-shortcut` defined, typing that keyboard shortcut will
 *      run the same command.
 *
 * @param {object} actions -- an object mapping the name of the action to the function to call when
 *   the menu item is clicked or the keyboard shortcut is pressed.
 */
Menu.setup = function(actions) {
    var _this = this;
    this._actions = actions;

    var menu = $(".menu");
    // maps keyboard shortcut to their function
    var shortcuts = {};

    // set up activating menu
    menu.children("li")
        .click(function() {
            menu.children("li.active").removeClass("active");

            if (menu.hasClass("active")) {
                menu.removeClass("active");
                return;
            }

            menu.addClass("active");
            $(this).addClass("active");

            // clicking off the menu will close the menu
            $(window).click(function(e) {
                var possibleMenu = $(e.target).closest(menu);
                if (possibleMenu.length === 0) {
                    menu.removeClass("active")
                        .children("li.active")
                        .removeClass("active");
                    $(this).off(e);
                }
            });
        })
        .mouseenter(function() {
            if (menu.hasClass("active")) {
                menu.children("li.active").removeClass("active");
                $(this).addClass("active");
            }
        });
        // TODO: functionality for hover over .has-submenu

    // set up click and add shortcuts to menu
    menu.find("li").each(function() {
        var _function = $(this).data("function");
        if (_function) {
            $(this).click(function() {
                _this.handle(_function);
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
            _this.handle(_function);
            e.preventDefault();
        }
    });
};

/**
 * Runs the menu function with the given name.
 */
Menu.handle = function(action) {
    this._actions[action]();
};

module.exports = Menu;
