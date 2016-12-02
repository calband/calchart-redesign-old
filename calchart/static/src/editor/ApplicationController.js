/**
 * @fileOverview Defines the abstract ApplicationController superclass, a singleton instance
 * for a Calchart application, such as the editor or the viewer.
 */

var JSUtils = require("./JSUtils");

/**
 * The class that stores the current state of the application and contains all
 * of the actions that can be run in the application.
 *
 * @param {Show} show -- the show for the controller
 * @param {object} actions -- a dictionary of actions that this application can do,
 *   mapping the name of the action to:
 *    - {string} name: the verbose name of the action (used for Undo text, help text, etc.)
 *    - {boolean} canUndo: true if the action can be undone
 *    - {boolean} clearsRedo: true if the action clears any actions that have been undone.
 *      Defaults to whatever canUndo is set to.
 *    - {function} do: the function that runs the action, taking the ApplicationController
 *      as a parameter
 */
var ApplicationController = function(show, actions) {
    this._show = show;

    this._actions = actions;
    this._undoHistory = [];
    this._redoHistory = [];
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
 * Runs the method on this instance with the given name.
 *
 * @param {string} name -- the function to call
 */
ApplicationController.prototype.do = function(name) {
    var action = this._actions[name];

    if (action === undefined) {
        throw new Error("No action with the name: " + name);
    }

    if (action.canUndo) {
        // save the current state
        this._undoHistory.push({
            label: action.name,
            content: $(".content").clone(true),
        });
    }

    // after doing an action, can't redo previous actions
    if (action.clearsRedo || (action.clearsRedo === undefined && action.canUndo)) {
        JSUtils.empty(this._redoHistory);
    }

    action.do(this);
};

/**
 * Restores the state of the application to the previous state
 */
ApplicationController.prototype.undo = function() {
    if (this._undoHistory.length === 0) {
        return;
    }

    var content = this._undoHistory.pop();
    $(".content")
        .after(content)
        .remove();
};

/**
 * Redoes the last undone action
 */
ApplicationController.prototype.redo = function() {
    if (this._redoHistory.length === 0) {
        return;
    }

    var name = this._redoHistory.pop();
    this.do(name, false);
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
