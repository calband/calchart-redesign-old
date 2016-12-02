/**
 * Contains all website-wide utility functions.
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
 * @param {object} options -- an object containing additional parameters, such as:
 *   - {function} init -- optional function to run before the popup is shown
 *   - {function} onSubmit -- optional function to run when the Save button is pressed
 */
CalchartUtils.showPopup = function(name, options) {
    var popup = $(".popup-box." + name).addClass("active");

    // clear inputs and messages
    CalchartUtils.clearMessages();
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
CalchartUtils.hidePopup = function(popup) {
    if (typeof popup === "string") {
        popup = $(".popup-box." + popup);
    }

    $(".popup").hide();
    $(popup).removeClass("active");
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
 * Clears all messages on the page
 */
CalchartUtils.clearMessages = function() {
    $("p.message").remove();
};

/**
 * Scroll the parent if the given element is hidden from view
 *
 * @param {jQuery} element -- the element to check visibility
 */
CalchartUtils.scrollIfHidden = function(element) {
    var parent = $(element).parent();

    // height of the parent
    var height = parseInt(parent.outerHeight());
    // distance between top of parent and top of visible edge of parent
    var visibleTop = parent.scrollTop();
    // distance between top of parent and bottom of visible edge of parent
    var visibleBottom = visibleTop + height;

    // distance between top of parent and top of element
    var selectedTop = $(element).position().top + visibleTop;
    // distance between top of parent and bottom of element
    var selectedBottom = selectedTop + $(element).outerHeight();

    // amount of space beyond the object to scroll
    var margin = 10;

    // at least part of selected element is below what is visible
    if (selectedBottom >= visibleBottom) {
        var difference = selectedBottom - height;
        if (difference > 0) {
            parent.scrollTop(difference + margin);
        } else {
            parent.scrollTop(0);
        }
    }
    // at least part of selected element is above what is visible
    else if (selectedTop < visibleTop) {
        parent.scrollTop(selectedTop - margin);
    }
};

module.exports = CalchartUtils;
