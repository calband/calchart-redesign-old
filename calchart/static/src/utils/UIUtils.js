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
            // TODO: slide down an ajax error message at the top of the screen
            console.error(xhr);
            alert("An error occurred");
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
 * Show a context menu with the given items
 *
 * @param {Event} e -- the click event that activated the context menu
 * @param {object} items -- the items to show in the context menu,
 *   mapping label to action. Can also map to another object, which
 *   will be a submenu
 */
UIUtils.showContextMenu = function(e, items) {
    e.preventDefault();

    var closeMenus = function() {
        $(".context-menu").remove();
    };

    // close any existing menus
    closeMenus();
    var menu = HTMLBuilder.make("ul.context-menu").appendTo("body");

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
    $(window).click(function(e) {
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
        container = HTMLBuilder.make("ul.messages").appendTo("body");
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
