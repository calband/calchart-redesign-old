/**
 * @fileOverview This file is organized in the following sections:
 *
 * - Form utilities
 * - Menu utilities
 * - Panel utilities
 * - Popup utilities
 * - Message utilities
 */

var HTMLBuilder = require("./HTMLBuilder");

/**
 * Contains all utility functions for interacting with UI elements
 * of the application
 */
var UIUtils = {};

/**** FORMS ****/

/**
 * Send an AJAX POST action to the server with the given
 * action name and the given parameters
 *
 * @param {string} action -- the name of the action
 * @param {object|undefined} params -- an optional object mapping
 *   key/value pairs to send to the server
 * @param {function|undefined} success -- an optional function to run after
 *   successfully doing action
 */
UIUtils.doAction = function(action, params, success) {
    if (typeof params === "function") {
        // params is optional, and was left out in this case, with the success
        // function being passed as this argument
        success = params;
        params = undefined;
    }

    var data = {
        csrfmiddlewaretoken: $("input[name=csrfmiddlewaretoken]").val(),
        action: action,
    };
    $.extend(data, params);

    $.ajax("", {
        method: "POST",
        data: data,
        success: success,
        error: function(xhr) {
            console.error(xhr);
            UIUtils.showError("An error occurred.");
        },
    });
};

/**
 * Get data from any form elements that are children of the given element
 *
 * @param {jQuery} parent -- the parent element to start looking for form elements
 * @return {object} key/value pairs mapping name to value
 */
UIUtils.getData = function(parent) {
    var data = {};
    $(parent).find("input, select, textarea").each(function() {
        var name = $(this).attr("name");
        if (name) {
            var value = $(this).val();
            data[name] = value;
        }
    });
    return data;
};

/**** MENUS ****/

/**
 * Bind the given submenu to the parent.
 *
 * @param {jQuery} container -- the parent's container
 * @param {jQuery} parent -- the menu item that shows the submenu
 * @param {jQuery} submenu -- the submenu that will be shown
 */
UIUtils.bindSubmenu = function(container, parent, submenu) {
    $(parent)
        .addClass("has-submenu")
        .mouseenter(function() {
            var offset = $(parent).offset();

            // manually offset a pixel to accentuate hover
            var top = offset.top + 1;
            var left = offset.left + $(parent).outerWidth() - 1;
            var right = offset.left + 1;

            $(parent).addClass("active");

            $(submenu)
                .smartPosition(top, left, right)
                .show();

            $(container).on("mouseenter", "li", function(e) {
                if (!$(this).is(parent)) {
                    $(parent).removeClass("active");
                    $(submenu).hide();
                    $(container).off(e);
                }
            });
        });

    $(submenu).appendTo("body");
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
 * @param {(jQuery|string)} menu - The jQuery selector or object to setup as
 *   a menu.
 */
UIUtils.setupMenu = function(menu) {
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
                    window.controller.doAction(action);
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
UIUtils.setupToolbar = function(toolbar) {
    var isMac = JSUtils.isMac();
    var shortcutCommands = this.getAllShortcutCommands();
    var convertShortcut = function(shortcut) {
        // HTML codes: http://apple.stackexchange.com/a/55729
        shortcut = shortcut.split("+").map(function(key) {
            switch (key) {
                case "ctrl":
                    return isMac ? "&#8984;" : "Ctrl";
                case "alt":
                    return isMac ? "&#8997;" : "Alt";
                case "shift":
                    return isMac ? "&#8679;" : "Shift";
                case "backspace":
                    return isMac ? "&#9003;" : "Backspace";
                case "tab":
                    return isMac ? "&#8677;" : "Tab";
                case "enter":
                    return isMac ? "&crarr;" : "Enter";
                case "left":
                    return isMac ? "&larr;" : "Left";
                case "up":
                    return isMac ? "&uarr;" : "Up";
                case "right":
                    return isMac ? "&rarr;" : "Right";
                case "down":
                    return isMac ? "&darr;" : "Down";
                case "delete":
                    return isMac ? "&#8998;" : "Del";
                default:
                    return key.toUpperCase();
            }
        });
        if (isMac) {
            return shortcut.join("");
        } else {
            return shortcut.join("+");
        }
    };

    // set up click and tooltip
    $(toolbar).find("li").each(function() {
        var toolbarItem = this;
        var name = $(this).data("name");
        var action = $(this).data("action");
        var shortcut = shortcutCommands[action];

        $(this)
            .mousedown(function() {
                if (!$(this).hasClass("disabled")) {
                    $(this).addClass("focus");
                }
            })
            .mouseup(function() {
                if (!$(this).hasClass("focus")) {
                    return;
                }

                $(this).removeClass("focus");
                if (action !== undefined) {
                    window.controller.doAction(action);
                }
            });

        if (name !== undefined) {
            // update name with shortcut
            if (shortcut !== undefined) {
                name += " (" + convertShortcut(shortcut) + ")";
            }

            var tooltipTimeout = null;
            var tooltip = HTMLBuilder.span("", "tooltip").html(name);
            var arrow = HTMLBuilder.make("span.tooltip-arrow", tooltip);

            $(this).hover(function() {
                tooltipTimeout = setTimeout(function() {
                    tooltip.appendTo("body");

                    var offset = $(toolbarItem).offset();
                    var width = $(toolbarItem).outerWidth();
                    var left = offset.left - tooltip.outerWidth() / 2 + width / 2;
                    if (left < 0) {
                        left = 0;
                        arrow.css("left", offset.left + width / 2);
                    } else {
                        arrow.css("left", "");
                    }

                    tooltip.css({
                        top: offset.top - tooltip.outerHeight() - arrow.outerHeight() + 2,
                        left: left,
                    });
                }, 750);
            }, function() {
                clearTimeout(tooltipTimeout);
                tooltip.remove();
            });
        }
    });
};

/**
 * Show a context menu with the given items
 *
 * @param {Event} e -- the click event that activated the context menu
 * @param {object} items -- the items to show in the context menu,
 *   mapping label to action. Can also map to another object, which
 *   will be a submenu
 */
UIUtils.showContextMenu = function(e, items) {
    e.preventDefault();

    // prevent all parent elements from scrolling
    var parents = $(e.target).parents();

    var closeMenus = function() {
        $(".context-menu").remove();
        parents.removeClass("no-scroll");
    };

    // close any existing menus
    closeMenus();
    parents.addClass("no-scroll");
    var menu = HTMLBuilder.make("ul.context-menu", "body");

    var makeMenu = function(parent, items) {
        $.each(items, function(label, action) {
            var item = HTMLBuilder.li(label).appendTo(parent);
            if (typeof action === "string") {
                item.click(function() {
                    window.controller.doAction(action);
                    closeMenus();
                });
            } else {
                var submenu = HTMLBuilder.make("ul.context-menu.submenu");
                makeMenu(submenu, action);
                UIUtils.bindSubmenu(parent, item, submenu);
            }
        });
    };

    menu.empty();
    makeMenu(menu, items);

    menu.smartPosition(e.pageY, e.pageX);

    // clicking outside of context menu and its submenus closes them
    $(window).mousedown(function(e) {
        var target = $(e.target);
        if (target.notIn(".context-menu")) {
            closeMenus();
            $(this).off(e);
        }
    });
};

/**** PANELS ****/

/**
 * Set up a moveable panel
 *
 * @param {jQuery} panel -- the panel to set up
 * @param {object|undefined} options -- options to create a panel. Can include
 *   - {float} top -- the top of the initial position for the panel (defaults
 *     to center)
 *   - {float} left -- the left of the initial position for the panel (defaults
 *     to center)
 *   - {float} bottom -- the bottom of the initial position for the panel (defaults
 *     to center)
 *   - {float} right -- the right of the initial position for the panel (defaults
 *     to center)
 */
UIUtils.setupPanel = function(panel, options) {
    options = options || {};

    // set up initial position

    var position = {};

    if (options.top) {
        position.top = options.top;
    } else if (options.bottom) {
        position.top = $(window).height() - $(panel).outerHeight() - options.bottom;
    } else {
        position.top = $(window).height() / 2 - $(panel).outerHeight() / 2;
    }
    if (options.left) {
        position.left = options.left;
    } else if (options.right) {
        position.left = $(window).width() - $(panel).outerWidth() - options.right;
    } else {
        position.left = $(window).width() / 2 - $(panel).outerWidth() / 2;
    }

    $(panel).css(position);

    // make draggable

    $(panel).find(".panel-handle").on({
        mousedown: function(e) {
            var offset = $(this).offset();
            $(panel).data({
                drag: true,
                offset: {
                    top: offset.top - e.pageY,
                    left: offset.left - e.pageX,
                },
            });
        },
        mouseup: function() {
            $(panel).data("drag", false);
        },
    });

    $(window).on({
        mousemove: function(e) {
            var data = $(panel).data();
            if (data.drag) {
                e.preventDefault();

                var top = e.pageY + data.offset.top;
                var left = e.pageX + data.offset.left;

                // don't go out of window
                var maxX = $(window).width() - $(panel).outerWidth();
                var maxY = $(window).height() - $(panel).outerHeight();
                top = Math.min(Math.max(0, top), maxY);
                left = Math.min(Math.max(0, left), maxX);

                $(panel).css({
                    top: top,
                    left: left,
                });
            }
        },
    });
};

/**** POPUPS ****/

/**
 * Shows the popup with the given name
 *
 * @param {string} name -- the name of the popup to show
 * @param {object} options -- an object containing additional parameters, such as:
 *   - {function} init -- optional function to run before the popup is shown
 *   - {function} onSubmit -- optional function to run when the Save button is pressed
 *   - {function} onHide -- optional function to run after the popup is hidden
 */
UIUtils.showPopup = function(name, options) {
    var popup = $(".popup-box." + name).addClass("active");

    // clear inputs
    popup.find("input, select, textarea").val("");

    if (options.init !== undefined) {
        options.init(popup);
    }

    popup.find("form")
        .off("submit.popup")
        .on("submit.popup", function(e) {
            e.preventDefault();

            if (options.onSubmit !== undefined) {
                options.onSubmit(popup);
            }
        });

    $(".popup").show();
    popup.data("onHide", options.onHide);

    // auto focus on first input
    popup.find("input, select, textarea").first().focus();
};

/**
 * Hides the currently active popup
 */
UIUtils.hidePopup = function() {
    var popup = $(".popup-box.active");

    $(".popup").hide();
    popup.removeClass("active");

    var onHide = popup.data("onHide");
    if (onHide) {
        onHide(popup);
    }
};

/**** MESSAGES ****/

/**
 * Show a message at the top of the screen
 *
 * @param {string} message -- the message to show
 * @param {boolean} isError -- true if message is an error message
 */
UIUtils.showMessage = function(message, isError) {
    var container = $("ul.messages");
    if (!container.exists()) {
        container = HTMLBuilder.make("ul.messages", "body");
    }

    var li = HTMLBuilder.li(message, "message").appendTo(container);
    if (isError) {
        li.addClass("error");
    }

    HTMLBuilder.icon("times", "close-message")
        .click(function() {
            li.fadeOut(function() {
                if (!container.children(":visible").exists()) {
                    container.remove();
                }
            });
        })
        .appendTo(li);
};

/**
 * Helper function to show an error message at the top of the screen
 */
UIUtils.showError = function(message) {
    UIUtils.showMessage(message, true);
};

module.exports = UIUtils;
