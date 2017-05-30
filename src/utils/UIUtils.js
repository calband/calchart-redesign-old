/**
 * @file This file contains utility functions useful for interacting
 * with UI elements consistent across Calchart. The file is organized
 * in the following sections:
 *
 * - Form utilities
 * - Menu utilities
 * - Panel utilities
 * - Message utilities
 * - Handles utilities
 */

import { ValidationError } from "utils/errors";
import HTMLBuilder from "utils/HTMLBuilder";
import { attempt, convertShortcut } from "utils/JSUtils";

/**** FORMS ****/

/**
 * Send an AJAX POST action to the server with the given
 * action name and the given parameters
 *
 * @param {string} action - The name of the action.
 * @param {Object} [params] - An optional object mapping
 *   key/value pairs to send to the server.
 * @param {Object} [options] - An optional object containing additional
 *   AJAX options.
 */
export function doAction(action, params={}, options={}) {
    let data = new FormData();
    data.append("csrfmiddlewaretoken", $("input[name=csrfmiddlewaretoken]").val());
    data.append("action", action);
    $.each(params, function(name, val) {
        data.append(name, val);
    });

    // http://www.mattlunn.me.uk/blog/2012/05/sending-formdata-with-jquery-ajax/
    let ajaxOptions = {
        method: "POST",
        data: data,
        cache: false,
        contentType: false,
        processData: false,
        error: function(xhr) {
            console.error(xhr);
            if (xhr.responseJSON) {
                showError(xhr.responseJSON.message);
            } else {
                showError("An error occurred.");
            }
        },
    };
    _.extend(ajaxOptions, options);

    $.ajax("", ajaxOptions);
}

/**
 * Prompt user to upload a file, running the given callback when the
 * files are selected.
 *
 * Source: http://stackoverflow.com/a/37524021/4966649
 *
 * @param {Function} callback - Receives the file(s) selected
 * @param {boolean} multiple - True if allow user to upload multiple files.
 */
export function promptFile(callback, multiple=false) {
    $("<input>")
        .attr("type", "file")
        .prop("multiple", multiple)
        .change(function() {
            let files = multiple ? this.files : this.files[0];
            callback.call(this, files);
        })
        .click();
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
            if ($(this).hasClass("disabled")) {
                return;
            }

            $(parent).addClass("active");

            // manually offset a pixel to accentuate hover
            let offset = $(parent).offset();
            let top = offset.top + 1;
            let left = offset.left + $(parent).outerWidth() - 1;

            $(submenu)
                .smartPosition(top, left, {
                    offRight: offset.left + 1,
                    offBottom: $(window).height(),
                })
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
                    if ($(this).hasClass("disabled")) {
                        return;
                    }

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

            setupTooltip(this, name);
        }
    });
}

/**
 * Set up a tooltip popup for the given element, using the given label.
 *
 * @param {jQuery|string} selector
 * @param {string} label
 */
export function setupTooltip(selector, label) {
    let tooltipTimeout = null;
    let tooltip = HTMLBuilder.span("", "tooltip").html(label);
    let arrow = HTMLBuilder.make("span.tooltip-arrow").appendTo(tooltip);

    $(selector)
        .mouseenter(function() {
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
        })
        .mouseleave(function() {
            clearTimeout(tooltipTimeout);
            tooltip.remove();
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
    let menu = HTMLBuilder.make("ul.context-menu").appendTo("body");

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
 *     to bottom-right of the screen)
 *   - {float} left - The left of the initial position for the panel. (defaults
 *     to bottom-right of the screen)
 *   - {float} bottom - The bottom of the initial position for the panel. (defaults
 *     to bottom-right of the screen)
 *   - {float} right - The right of the initial position for the panel. (defaults
 *     to bottom-right of the screen)
 */
export function setupPanel(panel, options={}) {
    // set up initial position

    let position = {};

    if (options.top) {
        position.top = options.top;
    } else {
        let bottom = _.defaultTo(options.bottom, 20);
        position.top = $(window).height() - $(panel).outerHeight() - bottom;
    }

    if (options.left) {
        position.left = options.left;
    } else {
        let right = _.defaultTo(options.right, 20);
        position.left = $(window).width() - $(panel).outerWidth() - right;
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

    $(panel).find(".panel-handle").mousedown(function(e) {
        let offset = $(this).offset();
        $(panel).data("offset", {
            top: offset.top - e.pageY,
            left: offset.left - e.pageX,
        });
        $(window).on({
            mousemove: movePanel,
            mouseup: function() {
                $(window).off("mousemove", movePanel);
            },
        });
    });

    // always keep panel on screen
    $(window).resize(() => {
        if ($(panel).is(":visible")) {
            $(panel).keepOnscreen();
        }
    });
}

/**** MESSAGES ****/

/**
 * Show a message at the top of the screen.
 *
 * @param {string} message
 * @param {object} [options] - Options to customize the message displayed:
 *   - {boolean} [isError=false] - true if message is an error message
 *   - {boolean} [autohide=!isError] - Automatically hide the message after
 *     a given time.
 * @return {jQuery} the message <li> element. Call li.delayHide() to hide
 *   the message after a given time.
 */
export function showMessage(message, options={}) {
    options = _.defaults({}, options, {
        isError: false,
    });
    options.autohide = _.defaultTo(options.autohide, !options.isError);

    let container = $("ul.messages");
    if (!container.exists()) {
        container = HTMLBuilder.make("ul.messages").appendTo("body");
    }

    let li = HTMLBuilder.li(message, "message").appendTo(container);
    if (options.isError) {
        li.addClass("error");
    }

    function hideMessage() {
        li.fadeOut(function() {
            if (!container.children(":visible").exists()) {
                container.remove();
            }
        });
    }

    li.delayHide = function() {
        setTimeout(hideMessage, 1000);
        return this;
    };

    if (options.autohide) {
        li.delayHide();
    } else {
        HTMLBuilder.icon("times", "close-message")
            .click(hideMessage)
            .appendTo(li);
    }

    return li;
}

/**
 * Show an error message at the top of the screen.
 */
export function showError(message, options={}) {
    options.isError = true;
    return showMessage(message, options);
}

/**** HANDLES ****/

/**
 * Add handles to the given container. The handles can be identified
 * by $("span.handle").data("handle-id"), which returns a number 0-8
 * like a T9 phone (minus 1).
 *
 * @param {jQuery} container
 */
export function addHandles(container) {
    _.range(3).forEach(i => {
        _.range(3).forEach(j => {
            let dir;
            if (i === 1 && j === 1) {
                return;
            } else if (i === 1) {
                dir = "vertical";
            } else if (j === 1) {
                dir = "horizontal";
            } else if (i === j) {
                dir = "nwse";
            } else {
                dir = "nesw";
            }

            $("<span>")
                .addClass(`handle ${dir}`)
                .data("handle-id", j * 3 + i)
                .css({
                    left: `calc(${i * 50}% - 5px)`,
                    top: `calc(${j * 50}% - 5px)`,
                })
                .appendTo(container);
        });
    });
}

/**
 * Get the data needed to resize an element in a GraphContext using a handle.
 *
 * @param {int} handle - The ID of the handle being used.
 * @param {object} start - An object containing the starting data of the
 *   resizable element. Contains the keys top, left, width, and height.
 * @param {Event} end - The mousemove event triggering the resize.
 * @return {object} The values to resize the element to, including top, left,
 *   width, and height.
 */
export function resizeHandles(handle, start, end) {
    let startWidth = start.width;
    let startHeight = start.height;
    let ratio = startWidth / startHeight;

    let div = Math.floor(handle / 3);
    let mod = handle % 3;

    let startX = start.left;
    let startY = start.top;

    if (mod === 2) {
        startX += start.width;
        startWidth *= -1;
    }
    if (div === 2) {
        startY += start.height;
        startHeight *= -1;
    }

    let [endX, endY] = $(".graph-workspace").makeRelative(end.pageX, end.pageY);
    let deltaX = endX - startX;
    let deltaY = endY - startY;

    // diagonal handles
    if (handle % 2 === 0) {
        if (handle % 8 !== 0) {
            ratio *= -1;
        }
        if (deltaX < deltaY * ratio) {
            deltaX = deltaY * ratio;
        } else {
            deltaY = deltaX / ratio;
        }
    }

    let data = _.clone(start);

    // handles to change width
    if (mod !== 1) {
        let x, width;
        if (deltaX > startWidth) {
            // handle on right side of element
            data.left = startX + startWidth;
            data.width = deltaX - startWidth;
        } else {
            // handle on left side of element
            data.left = startX + deltaX;
            data.width = startWidth - deltaX;
        }
    }

    // handles to change height
    if (div !== 1) {
        let y, height;
        if (deltaY > startHeight) {
            // handle on bottom side of element
            data.top = startY + startHeight;
            data.height = deltaY - startHeight;
        } else {
            // handle of top side of element
            data.top = startY + deltaY;
            data.height = startHeight - deltaY;
        }
    }

    return data;
}
