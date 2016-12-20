/**
 * @fileOverview This file is organized in the following sections:
 *
 * - Form utilities
 * - Popup utilities
 * - Panel utilities
 * - Message utilities
 */

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

/**** POPUPS ****/

/**
 * Shows the popup with the given name
 *
 * @param {string} name -- the name of the popup to show
 * @param {object} options -- an object containing additional parameters, such as:
 *   - {function} init -- optional function to run before the popup is shown
 *   - {function} onSubmit -- optional function to run when the Save button is pressed
 */
UIUtils.showPopup = function(name, options) {
    var popup = $(".popup-box." + name).addClass("active");

    // clear inputs and messages
    UIUtils.clearMessages();
    popup.find("input, select, textarea").val("");

    if (options.init !== undefined) {
        options.init.call(this, popup);
    }

    popup.find("form")
        .off("submit.popup")
        .on("submit.popup", function(e) {
            e.preventDefault();

            if (options.onSubmit !== undefined) {
                options.onSubmit.call(this, popup);
            }
        });

    $(".popup").show();
    $(".popup select").dropdown();

    // auto focus on first input
    popup.find("input:first").focus();
};

/**
 * Hides the given popup
 *
 * @param {jQuery|string} popup -- the popup or the name of the popup to hide
 */
UIUtils.hidePopup = function(popup) {
    if (typeof popup === "string") {
        popup = $(".popup-box." + popup);
    }

    $(".popup").hide();
    $(popup).removeClass("active");
};

/**** PANELS ****/

/**
 * Create a moveable panel with the given contents at the given position.
 *
 * @param {jQuery} contents -- the contents to populate the panel, wrapped in a div
 * @param {object|undefined} options -- options to create a panel. Can include
 *   - {float} top -- the top of the initial position for the panel (defaults
 *     to center)
 *   - {float} left -- the left of the initial position for the panel (defaults
 *     to center)
 *   - {float} bottom -- the bottom of the initial position for the panel (defaults
 *     to center)
 *   - {float} right -- the right of the initial position for the panel (defaults
 *     to center)
 * @return {jQuery} the created panel
 */
UIUtils.createPanel = function(contents, options) {
    options = options || {};

    var panel = $("<div>")
        .addClass("panel")
        .appendTo("body");

    $("<div>")
        .addClass("panel-handle")
        .appendTo(panel);

    contents.addClass("panel-content").appendTo(panel);

    var position = {};

    if (options.top) {
        position.top = options.top;
    } else if (options.bottom) {
        position.bottom = options.bottom;
    } else {
        position.top = $(window).height() / 2 - panel.outerHeight() / 2;
    }
    if (options.left) {
        position.left = options.left;
    } else if (options.right) {
        position.right = options.right;
    } else {
        position.left = $(window).width() / 2 - panel.outerWidth() / 2;
    }

    panel.css(position);

    return panel;
};

/**** MESSAGES ****/

/**
 * Show a message below the given element
 *
 * @param {string} message -- the message to show
 * @param {jQuery} element -- the element to add message after
 * @param {boolean} isError -- true if message is an error message
 */
UIUtils.showMessage = function(message, element, isError) {
    var messageElem = $(element).next("p.message");
    if (messageElem.exists()) {
        messageElem = $("<p>")
            .addClass("message")
            .insertAfter(element);
    }
    if (isError) {
        messageElem.addClass("error");
    } else {
        messageElem.removeClass("error");
    }
    messageElem.text(message);
};

/**
 * Helper function to show an error message below the given element
 */
UIUtils.showError = function(message, element) {
    UIUtils.showMessage(message, element, true);
};

/**
 * Clears all messages on the page
 */
UIUtils.clearMessages = function() {
    $("p.message").remove();
};

module.exports = UIUtils;
