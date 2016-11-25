/**
 * @fileOverview Defines any website-wide utility functions.
 */

var CalchartUtils = {};

/**
 * Send a POST action to the server with the given
 * action name and the given parameters
 *
 * @param {string} action -- the name of the action
 * @param {object|undefined} params -- an optional object mapping
 *   key/value pairs to send to the server
 */
CalchartUtils.doAction = function(action, params) {
    var form = $(".post-action");
    form.find("input:visible").remove();
    form.find("[name=action]").val(action);
    $.each(params || {}, function(key, val) {
        $("<textarea>")
            .attr("name", key)
            .val(val)
            .appendTo(form);
    });
    form.submit();
};

module.exports = CalchartUtils;
