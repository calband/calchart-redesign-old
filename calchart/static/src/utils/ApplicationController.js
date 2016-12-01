/**
 * @fileOverview Defines the abstract ApplicationController superclass, a singleton instance
 * for a Calchart application, such as the editor or the viewer.
 */

var JSUtils = require("./JSUtils");

 /**
  * The class that stores the current state of the application and contains all
  * of the actions that can be run in the editor page. This is a singleton
  * class, meaning that only one instance of this class will ever be created.
  * As a result, don't use this constructor directly; always get the
  * controller from ApplicationController.getInstance().
  */
var ApplicationController = function() {
    this._undoHistory = [];
    this._redoHistory = [];
};

/**
 * Causes a child class to inherit from ApplicationController. Use to include
 * non-prototype functions and properties, like getInstance()
 */
ApplicationController.makeSubClass = function(Controller) {
    JSUtils.extends(Controller, this);
    $.extend(Controller, this);
};

ApplicationController._instance = null;

/**
 * Gets the instance of ApplicationController. Use this instead of the constructor
 * to get the controller for the application.
 *
 * @return {ApplicationController} the singleton instance
 */
ApplicationController.getInstance = function() {
    if (this._instance === null) {
        this._instance = new this();
    }
    return this._instance
};

/**
 * Runs the method on this instance with the given name.
 *
 * @param {string} name -- the function to call
 * @param {boolean} clearRedo -- if true, clears the redo
 *   history. Defaults to true
 */
ApplicationController.prototype.do = function(name, clearRedo) {
    // save the current state
    this._undoHistory.push($(".content").clone(true));

    // after doing an action, can't redo previous actions
    if (clearRedo === false) {
        JSUtils.empty(this._redoHistory);
    }

    var _function = this[name];
    if (_function) {
        _function();
    } else {
        throw new Error(this.constructor.name + " has no function: " + name);
    }
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
ApplicationController.prototype.setupMenu = function(menu) {
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
ApplicationController.prototype.setupPanel = function(panel) {
    var _this = this;

    // set up click
    $(panel).find("li").click(function() {
        var name = $(this).data("function");
        _this.do(name);
    });

    // TODO: set up help text
};

module.exports = ApplicationController;
