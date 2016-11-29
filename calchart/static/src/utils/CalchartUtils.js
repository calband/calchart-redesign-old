/**
 * @fileOverview Defines any website-wide utility functions.
 */

var CalchartUtils = {};

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
CalchartUtils.doAction = function(action, params, success) {
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
 * Shows the popup with the given name
 *
 * @param {string} name -- the name of the popup to show
 * @param {function} init -- optional function to run before
 *   the popup is shown
 */
CalchartUtils.showPopup = function(name, init) {
    var popup = $(".popup-box." + name).addClass("active");

    if (init !== undefined) {
        init(popup);
    }

    $(".popup").show();
    $(".popup select").dropdown();
};

/**
 * Hides the popup with the given name
 *
 * @param {string} name -- the name of the popup to hide
 */
CalchartUtils.hidePopup = function(name) {
    $(".popup").hide();
    $(".popup-box." + name).removeClass("active");
};

/**
 * Get data from any form elements that are children of the given element
 *
 * @param {jQuery} parent -- the parent element to start looking for form elements
 * @return {object} key/value pairs mapping name to value
 */
CalchartUtils.getData = function(parent) {
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

/**
 * Show a message below the given element
 *
 * @param {string} message -- the message to show
 * @param {jQuery} element -- the element to add message after
 * @param {boolean} isError -- true if message is an error message
 */
CalchartUtils.showMessage = function(message, element, isError) {
    var messageElem = $(element).next("p.message");
    if (messageElem.length === 0) {
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
CalchartUtils.showError = function(message, element) {
    CalchartUtils.showMessage(message, element, true);
};

/**
 * Clears any messages below the given element
 */
CalchartUtils.clearMessage = function(element) {
    $(element).next("p.message").remove();
};

module.exports = CalchartUtils;
