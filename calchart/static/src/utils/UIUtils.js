/**
 * @file This file contains utility functions useful for interacting
 * with UI elements consistent across Calchart. The file is organized
 * in the following sections:
 *
 * - Form utilities
 * - Menu utilities
 * - Panel utilities
 * - Popup utilities
 * - Message utilities
 */

import * as _ from "lodash";

import { ValidationError } from "utils/errors";
import HTMLBuilder from "utils/HTMLBuilder";
import { convertShortcut } from "utils/JSUtils";

/**** FORMS ****/

/**
 * Send an AJAX POST action to the server with the given
 * action name and the given parameters
 *
 * @param {string} action - The name of the action.
 * @param {Object} [params] - An optional object mapping
 *   key/value pairs to send to the server.
 * @param {function} [success] - An optional function to run after
 *   successfully doing action.
 */
export function doAction(action, params={}, success=null) {
    // params is optional, and was left out in this case, with the success
    // function being passed as this argument
    if (_.isFunction(params)) {
        success = params;
        params = {};
    }

    let data = {
        csrfmiddlewaretoken: $("input[name=csrfmiddlewaretoken]").val(),
        action: action,
    };
    _.extend(data, params);

    $.ajax("", {
        method: "POST",
        data: data,
        success: success,
        error: function(xhr) {
            console.error(xhr);
            showError("An error occurred.");
        },
    });
}

/**
 * Get data from any form elements that are children of the given element
 *
 * @param {jQuery} parent - The parent element to start looking for form elements.
 * @return {Object} Key/value pairs mapping name to value.
 */
export function getData(parent) {
    let data = {};
    $(parent).find("input, select, textarea").each(function() {
        let name = $(this).attr("name");
        if (name) {
            let value = $(this).val();
            data[name] = value;
        }
    });
    return data;
}

/**** MENUS ****/

/**
 * Add a shortcut hint for the given action to the given menu item.
 *
 * @param {jQuery} li - The menu item.
 * @param {string} action
 */
function addShortcutHint(li, action) {
    let shortcut = window.controller.shortcutCommands[action];
    if (!_.isUndefined(shortcut)) {
        HTMLBuilder.span("", "hint")
            .html(convertShortcut(shortcut))
            .appendTo(li);
    }
}

/**
 * Bind the given submenu to the parent.
 *
 * @param {jQuery} container - The parent's container.
 * @param {jQuery} parent - The menu item that shows the submenu.
 * @param {jQuery} submenu - The submenu that will be shown.
 */
export function bindSubmenu(container, parent, submenu) {
    $(parent)
        .addClass("has-submenu")
        .mouseenter(function() {
            let offset = $(parent).offset();

            // manually offset a pixel to accentuate hover
            let top = offset.top + 1;
            let left = offset.left + $(parent).outerWidth() - 1;
            let right = offset.left + 1;

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
}

/**
 * Set up the given menu element.
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
export function setupMenu(menu) {
    let menuTabs = $(menu).children();

    function closeSubmenus() {
        menuTabs.removeClass("active");
        $(".has-submenu.active").removeClass("active");
        $(".submenu").hide();
        $(window).off(".close-submenus");
    }

    function openSubmenu(menuTab, submenu) {
        closeSubmenus();
        $(menuTab).addClass("active");

        let offset = $(menuTab).offset();
        $(submenu)
            .css({
                top: offset.top + $(menuTab).outerHeight(),
                left: offset.left,
            })
            .show();

        // clicking outside of menu and its submenus closes them
        $(window).on("click.close-submenus", function(e) {
            let target = $(e.target);
            if (target.notIn(menuTabs) && target.notIn(".submenu")) {
                closeSubmenus();
            }
        });
    }

    // recursively set up menu items
    function setupMenuItems(submenu) {
        $(submenu).find("li").each(function() {
            let action = $(this).data("action");
            if (action) {
                $(this).click(function() {
                    window.controller.doAction(action);
                    closeSubmenus();
                });
            }

            addShortcutHint(this, action);

            let subsubmenu = $(this).children(".submenu");
            if (subsubmenu.exists()) {
                bindSubmenu(submenu, this, subsubmenu);
                setupMenuItems(subsubmenu);
            }
        });
    }

    menuTabs.each(function() {
        let submenu = $(this).children(".submenu").appendTo("body");

        // clicking toggles active menu
        $(this).click(function() {
            if ($(menu).children(".active").exists()) {
                closeSubmenus();
            } else {
                openSubmenu(this, submenu);
            }
        });

        // activate submenu when hovered over
        $(this).mouseenter(function() {
            if ($(menu).children(".active").not(this).exists()) {
                openSubmenu(this, submenu);
            }
        });

        setupMenuItems(submenu);
    });
}

/**
 * Set up the given toolbar element.
 *
 * @param {jQuery|string} toolbar - jQuery object or toolbar to setup.
 */
export function setupToolbar(toolbar) {
    let controller = window.controller;

    // set up click and tooltip
    $(toolbar).find("li").each(function() {
        let name = $(this).data("name");
        let action = $(this).data("action");
        let shortcut = controller.shortcutCommands[action];

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

        if (!_.isUndefined(name)) {
            // update name with shortcut
            if (!_.isUndefined(shortcut)) {
                let shortcutHint = convertShortcut(shortcut);
                name = `${name} (${shortcutHint})`;
            }

            let tooltipTimeout = null;
            let tooltip = HTMLBuilder.span("", "tooltip").html(name);
            let arrow = HTMLBuilder.make("span.tooltip-arrow", tooltip);

            $(this).hover(function() {
                let offset = $(this).offset();
                let width = $(this).outerWidth();

                tooltipTimeout = setTimeout(function() {
                    tooltip.appendTo("body");

                    let left = offset.left - tooltip.outerWidth() / 2 + width / 2;
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
}

/**
 * Show a context menu with the given items.
 *
 * @param {Event} e - The click event that activated the context menu.
 * @param {Object.<string, (string|Object)>} items - The items to show
 *   in the context menu, mapping label to action. Can also map to
 *   another object, which will be a submenu.
 */
export function showContextMenu(e, items) {
    e.preventDefault();

    // prevent all parent elements from scrolling
    let parents = $(e.target).parents();

    function closeMenus() {
        $(".context-menu").remove();
        parents.unlockScroll();
    };

    // close any existing menus
    closeMenus();
    parents.lockScroll();
    let menu = HTMLBuilder.make("ul.context-menu", "body");

    // recursively setup menu items
    function makeMenu(parent, items) {
        _.each(items, function(action, label) {
            let item = HTMLBuilder.li(label).appendTo(parent);
            if (_.isString(action)) {
                item.click(function() {
                    window.controller.doAction(action);
                    closeMenus();
                });

                addShortcutHint(item, action);
            } else {
                let submenu = HTMLBuilder.make("ul.context-menu.submenu");
                makeMenu(submenu, action);
                bindSubmenu(parent, item, submenu);
            }
        });
    };

    makeMenu(menu, items);

    menu.smartPosition(e.pageY, e.pageX);

    // clicking outside of context menu and its submenus closes them
    $(window).mousedown(function(e) {
        if ($(e.target).notIn(".context-menu")) {
            closeMenus();
            $(this).off(e);
        }
    });
}

/**** PANELS ****/

/**
 * Set up a moveable panel.
 *
 * @param {jQuery} panel - The panel to set up.
 * @param {Object} [options] - Options to create a panel. Can include:
 *   - {float} top - The top of the initial position for the panel. (defaults
 *     to center of the screen)
 *   - {float} left - The left of the initial position for the panel. (defaults
 *     to center of the screen)
 *   - {float} bottom - The bottom of the initial position for the panel. (defaults
 *     to center of the screen)
 *   - {float} right - The right of the initial position for the panel. (defaults
 *     to center of the screen)
 */
export function setupPanel(panel, options={}) {
    // set up initial position

    let position = {};

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

    function movePanel(e) {
        e.preventDefault();

        let offset = $(panel).data("offset");
        let top = e.pageY + offset.top;
        let left = e.pageX + offset.left;

        // don't go out of window
        let maxX = $(window).width() - $(panel).outerWidth();
        let maxY = $(window).height() - $(panel).outerHeight();

        $(panel).css({
            top: _.clamp(top, 0, maxY),
            left: _.clamp(left, 0, maxX),
        });
    }

    $(panel).find(".panel-handle").on({
        mousedown: function(e) {
            let offset = $(this).offset();
            $(panel).data("offset", {
                top: offset.top - e.pageY,
                left: offset.left - e.pageX,
            });
            $(window).on("mousemove", movePanel);
        },
        mouseup: function() {
            $(window).off("mousemove", movePanel);
        },
    });
}

/**** POPUPS ****/

/**
 * Show the popup with the given name.
 *
 * @param {string} name - The name of the popup to show.
 * @param {object} [options] - An object containing optional parameters, such as:
 *   - {function(jQuery)} init - Function to run before the popup is shown.
 *   - {function(jQuery)} onSubmit - Function to run when the Save button is pressed.
 *     If any ValidationErrors are thrown, shows a UI error message and exits without
 *     closing the popup.
 *   - {function(jQuery)} onHide - Function to run after the popup is hidden.
 */
export function showPopup(name, options={}) {
    let popup = $(`.popup-box.${name}`).addClass("active");

    if (options.init !== undefined) {
        options.init(popup);
    }

    // event listener to submit form
    popup
        .on("submit.popup", "form", function(e) {
            e.preventDefault();

            if (!_.isUndefined(options.onSubmit)) {
                try {
                    options.onSubmit(popup);
                } catch (e) {
                    if (e instanceof ValidationError) {
                        showError(e.message);
                        return;
                    } else {
                        throw e;
                    }
                }
            }

            hidePopup();
        });

    // event listeners to close popup
    $(".popup")
        .on("click.popup", function(e) {
            if (!$(e.target).closest(".popup-box").exists()) {
                hidePopup();
            }
        })
        .on("click.popup", ".popup-box button.cancel", function() {
            hidePopup();
        });

    // ESC closes popup
    $(window)
        .on("keydown.popup", function(e) {
            if (e.which === 27) {
                hidePopup();
            }
        });

    $(".popup").show();
    popup.data("onHide", options.onHide);

    // auto focus on first input
    popup.find("input, select, textarea").first().focus();
}

/**
 * Hide the currently active popup.
 */
export function hidePopup() {
    let popup = $(".popup-box.active");

    popup.removeClass("active")
        .parent()
        .hide();

    // clear inputs
    popup.find("input, select, textarea").val("");

    // remove event listeners
    popup.off(".popup");
    $(".popup").off(".popup");
    $(window).off(".popup");

    let onHide = popup.data("onHide");
    if (onHide) {
        onHide(popup);
    }
}

/**** MESSAGES ****/

/**
 * Show a message at the top of the screen.
 *
 * @param {string} message
 * @param {boolean} isError - true if message is an error message.
 */
export function showMessage(message, isError) {
    let container = $("ul.messages");
    if (!container.exists()) {
        container = HTMLBuilder.make("ul.messages", "body");
    }

    let li = HTMLBuilder.li(message, "message").appendTo(container);
    if (isError) {
        li.addClass("error");
    }

    function removeMessage() {
        li.fadeOut(function() {
            if (!container.children(":visible").exists()) {
                container.remove();
            }
        });
    }

    HTMLBuilder.icon("times", "close-message")
        .click(removeMessage)
        .appendTo(li);

    setTimeout(removeMessage, 2000);
}

/**
 * Show an error message at the top of the screen.
 */
export function showError(message) {
    showMessage(message, true);
}
