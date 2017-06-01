/**
 * @file This file contains utility functions useful for interacting
 * with UI elements consistent across Calchart. The file is organized
 * in the following sections:
 *
 * - Form utilities
 * - Message utilities
 * - Handles utilities
 */

import HTMLBuilder from "utils/HTMLBuilder";
import { attempt } from "utils/JSUtils";

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

/**** MESSAGES ****/

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

            clearTimeout(tooltipTimeout);
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
        .on("click mouseleave", function() {
            clearTimeout(tooltipTimeout);
            tooltip.remove();
        });
}

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
