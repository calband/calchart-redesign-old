/**
 * @fileOverview This file defines the ApplicationController, the abstract superclass
 * for application controllers: singleton instances that control an entire Calchart
 * application. Functions in this file are organized alphabetically in the following
 * sections:
 *
 * - Constructors (including initialization functions)
 * - Instance methods
 * - Helpers (prefixed with an underscore)
 */

var errors = require("calchart/errors");
var HTMLBuilder = require("utils/HTMLBuilder");
var JSUtils = require("utils/JSUtils");
var UIUtils = require("utils/UIUtils");

/**** CONSTRUCTORS ****/

/**
 * The abstract superclass that stores the current state of a Calchart application and
 * contains all of the actions that can be run in the application. This class is
 * a singleton, meaning that only one instance of this class will ever be initialized.
 * To maintain this property, never use the constructor directly; instead, use
 * ApplicationController.init()
 *
 * @param {Show} show -- the show for the controller
 */
var ApplicationController = function(show) {
    this._show = show;
};

// The singleton instance of the ApplicationController
window.controller = null;

/**
 * Initialize an ApplicationController if one has not already been initialized.
 *
 * @param {Show} show -- the show for the controller
 */
ApplicationController.init = function(show) {
    if (!window.controller) {
        window.controller = new this(show);
        window.controller.init();
    }

    return window.controller;
};

/**
 * Use this class to subclass instead of JSUtils.extends in order to inherit
 * the ApplicationController.init function.
 */
ApplicationController.extend = function(ChildClass) {
    JSUtils.extends(ChildClass, this);
    $.extend(ChildClass, this);
};

/**** INSTANCE METHODS ****/

/**
 * Holds all keyboard shortcuts for the controller, mapping keyboard shortcut
 * to the name of the ApplicationController function. Separate keys with "+".
 * e.g. "ctrl+s" or "ctrl+shift+s". Meta keys need to be in this order:
 * ctrl (alias for cmd on Mac), alt, shift. Non-character keys can be mapped
 * as: top, left, down, right, enter, tab, backspace, delete.
 */
ApplicationController.prototype.shortcuts = {};

/**
 * Runs the method on this instance with the given name.
 *
 * @param {string} name -- the function to call
 * @param {Array|undefined} args -- arguments to pass to the action. Can also
 *   be passed in name (see _parseAction), which will override any arguments
 *   passed in as a parameter
 */
ApplicationController.prototype.doAction = function(name, args) {
    var action = this._getAction(name);
    args = action.args || args || [];
    action.function.apply(this, args);
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
 * Initialize this controller
 */
ApplicationController.prototype.init = function() {
    var _this = this;

    // set up keyboard shortcuts
    $(window).keydown(function(e) {
        // ignore keypresses when typing into an input field
        if ($("input:focus").exists()) {
            return;
        }

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

        // http://api.jquery.com/event.which/
        var code = e.which;

        switch (code) {
            case 8:
                pressedKeys.push("backspace"); break;
            case 9:
                pressedKeys.push("tab"); break;
            case 13:
                pressedKeys.push("enter"); break;
            case 37:
                pressedKeys.push("left"); break;
            case 38:
                pressedKeys.push("up"); break;
            case 39:
                pressedKeys.push("right"); break;
            case 40:
                pressedKeys.push("down"); break;
            case 46:
                pressedKeys.push("delete"); break;
            default:
                var character = String.fromCharCode(code).toLowerCase();
                pressedKeys.push(character);
        }

        var _function = _this._getShortcut(pressedKeys.join("+"));
        if (_function) {
            _this.doAction(_function);
            e.preventDefault();
        }
    });
};

/**** HELPERS ****/

/**
 * Get the action represented by the given parameter
 *
 * @param {string} name -- the function name (see _parseAction)
 * @return {object} an object of the form
 *   {
 *       function: function,
 *       args: Array|null,
 *   }
 */
ApplicationController.prototype._getAction = function(name) {
    var data = this._parseAction(name);
    var action = this[data.name];

    if (typeof action === "function") {
        return {
            function: action,
            args: data.args,
        };
    } else {
        throw new errors.ActionError("No action with the name: " + data.name);
    }
};

/**
 * Get the shortcut function for the given shortcut key binding
 *
 * @param {string} shortcut -- the shortcut keys, e.g. "ctrl+z"
 * @return {function|undefined} the shortcut function, if there is one
 */
ApplicationController.prototype._getShortcut = function(shortcut) {
    return this.shortcuts[shortcut];
};

/**
 * Parses the given function name. The function name can be in one of the following formats:
 *
 * @param {string} name -- the function name, in one of the following formats:
 *   - <name>: the name of the function, without arguments specified
 *   - <name>(<args>): the name of the function, run with the given comma separated arguments.
 *     Arguments can be given in the following formats:
 *       - a number; e.g. "foo(1)" -> `foo(1)`
 *       - a string; e.g. "foo(bar)" -> `foo("bar")`
 *       - an object; e.g. "foo(x=1)" -> `foo({x: 1})`
 *       - an array; e.g. "foo(bar, [1,2])" -> `foo("bar", [1,2])`
 * @return {object} an object of the form
 *   {
 *       name: string,
 *       args: Array|null,
 *   }
 */
ApplicationController.prototype._parseAction = function(name) {
    var actionMatch = name.match(/^(\w+)(\((.+)\))?$/);

    if (actionMatch === null) {
        throw new Error("Action name in an invalid format: " + name);
    }

    var actionName = actionMatch[1];
    var actionArgs = null;

    if (actionMatch[2]) {
        actionArgs = [];

        // manually split arguments, to avoid complicated regexes
        var argsData = actionMatch[3];
        var buffer = "";
        for (var i = 0; i < argsData.length; i++) {
            var char = argsData[i];
            switch (char) {
                case ",":
                    actionArgs.push(buffer);
                    buffer = "";
                    break;
                case "[":
                    while (char !== "]") {
                        buffer += char;
                        i++;
                        char = argsData[i];
                    }
                    // don't break to add ending bracket
                default:
                    buffer += char;
            }
        }
        actionArgs.push(buffer);

        // parse arguments
        actionArgs = $.map(actionArgs, function(arg) {
            arg = arg.trim();

            // float or array
            try {
                return JSON.parse(arg);
            } catch (e) {}

            // object
            if (arg.indexOf("=") !== -1) {
                var split = arg.split("=");

                var key = split[0];
                var val = parseFloat(split[1]);
                if (isNaN(val)) {
                    val = split[1];
                }

                var obj = {};
                obj[key] = val;
                return obj;
            }

            // string
            return arg;
        });
    }

    return {
        name: actionName,
        args: actionArgs,
    };
};

/**
 * Sets up the given menu element.
 *
 * - "menu" refers to the main menu container, which contain the menu tabs
 * - "menu tab" refers to the elements in the main menu container that can
 *   be clicked on to open their corresponding submenu.
 * - "submenu" refers to any menu containing menu items
 * - "menu item" refers to any item in a submenu that can do actions or open
 *   another submenu
 *
 * @param {jQuery|string} menu -- jQuery object or selector to setup
 */
ApplicationController.prototype._setupMenu = function(menu) {
    var controller = this;

    // open the given menu tab
    var openSubmenu = function(menuTab, submenu) {
        closeSubmenus();
        $(menuTab).addClass("active");

        var offset = $(menuTab).offset();
        $(submenu)
            .css({
                top: offset.top + $(menuTab).outerHeight(),
                left: offset.left,
            })
            .show();
    };

    // close all submenus
    var closeSubmenus = function() {
        $(menu).children().removeClass("active");
        $(".submenu").hide();
        $(window).off(".close-submenus");
    };

    // recursively set up submenu items
    var setupMenuItems = function(submenu) {
        $(submenu).find("li").each(function() {
            var action = $(this).data("action");
            if (action) {
                $(this).click(function() {
                    controller.doAction(action);
                    closeSubmenus();
                });
            }

            var subsubmenu = $(this).children(".submenu");
            if (subsubmenu.exists()) {
                UIUtils.bindSubmenu(submenu, this, subsubmenu);
                setupMenuItems(subsubmenu);
            }
        });
    };

    var menuTabs = $(menu).children();
    menuTabs.each(function() {
        var menuTab = this;
        var submenu = $(this).children(".submenu").appendTo("body");

        // clicking toggles active menu
        $(this).click(function() {
            if ($(menu).children(".active").exists()) {
                closeSubmenus();
            } else {
                openSubmenu(menuTab, submenu);

                // clicking outside of menu and its submenus closes them
                $(window).on("click.close-submenus", function(e) {
                    var target = $(e.target);
                    if (target.notIn(menuTabs) && target.notIn(".submenu")) {
                        closeSubmenus();
                        $(this).off(e);
                    }
                });
            }
        });

        // activate submenu when hovered over
        $(this).mouseenter(function() {
            if ($(menu).children(".active").not(menuTab).exists()) {
                openSubmenu(menuTab, submenu);
            }
        });

        setupMenuItems(submenu);
    });
};

/**
 * Sets up the given toolbar element
 *
 * @param {jQuery|string} toolbar -- jQuery object or toolbar to setup
 */
ApplicationController.prototype._setupToolbar = function(toolbar) {
    var _this = this;
    var tooltipTimeout = null;

    // set up click
    $(toolbar).find("li")
        .mousedown(function(e) {
            if (!$(this).hasClass("disabled")) {
                $(this).addClass("focus");
            }
        })
        .mouseup(function() {
            if (!$(this).hasClass("focus")) {
                return;
            }

            $(this).removeClass("focus");
            var name = $(this).data("action");
            if (name !== undefined) {
                _this.doAction(name);
            }
        })
        .hover(function() {
            // tooltip above item
            var offset = $(this).offset();
            var width = $(this).outerWidth();
            var name = $(this).data("name");

            if (name === undefined) {
                return;
            }

            tooltipTimeout = setTimeout(function() {
                var tooltip = HTMLBuilder.span(name, "tooltip").appendTo("body");

                var arrow = HTMLBuilder
                    .make("span.tooltip-arrow")
                    .appendTo(tooltip);

                var left = offset.left - tooltip.outerWidth() / 2 + width / 2;
                if (left < 0) {
                    left = 0;
                    arrow.css("left", offset.left + width / 2);
                }

                tooltip.css({
                    top: offset.top - tooltip.outerHeight() - arrow.outerHeight(),
                    left: left,
                });
            }, 750);
        }, function() {
            clearTimeout(tooltipTimeout);
            $(".tooltip").remove();
        });
};

module.exports = ApplicationController;
