var BaseContext = require("./BaseContext");
var Continuity = require("../Continuity");
var HTMLBuilder = require("../../utils/HTMLBuilder");
var JSUtils = require("../../utils/JSUtils");
var UIUtils = require("../../utils/UIUtils");

/**
 * The default editor context, that allows a user to edit dot
 * continuities and step through marching
 */
var ContinuityContext = function(grapher, sheet) {
    BaseContext.call(this, grapher, sheet);

    this._panel = $(".panel.edit-continuity");
};

JSUtils.extends(ContinuityContext, BaseContext);

ContinuityContext.prototype.shortcuts = {
};

ContinuityContext.prototype.load = function() {
    var _this = this;

    UIUtils.setupPanel(this._panel, {
        bottom: 20,
        right: 20,
        onInit: function(panel) {
            panel.on("click", ".tab", function() {
                _this._changeTab(this);
            });

            panel.show()
                .find(".add-continuity select")
                .dropdown({
                    placeholder_text_single: "Add continuity...",
                    disable_search_threshold: false,
                })
                .change(function() {
                    _this._addContinuity($(this).val());

                    $(this).val("")
                        .trigger("chosen:updated");
                });

            panel.on("click", ".continuity .edit", function() {
                var continuity = $(this).parents(".continuity").data("continuity");

                console.log(continuity);
                // TODO: edit continuity popup
            });

            panel.on("click", ".continuity .delete", function() {
                var elem = $(this).parents(".continuity");
                var continuity = elem.data("continuity");
                elem.remove();

                console.log(continuity);
                // TODO: remove from Sheet
            });
        },
    });
    this._updatePanel();
    this._panel.show();
    
    $(".toolbar .edit-continuity").addClass("active");
};

ContinuityContext.prototype.loadSheet = function(sheet) {
    BaseContext.prototype.loadSheet.call(this, sheet);

    this._updatePanel();
};

ContinuityContext.prototype.unload = function() {
    this._panel.hide();
    // this.removeEvents();

    $(".toolbar .edit-continuity").removeClass("active");
};

/**** HELPERS ****/

/**
 * Add the continuity with the given code
 *
 * @param {string} type -- the type of Continuity to add (see Continuity)
 */
ContinuityContext.prototype._addContinuity = function(type) {
    var continuity = new Continuity(type);

    continuity.appendTo(this._panel.find(".continuities"));

    // TODO: add to Sheet
};

/**
 * Change the currently active dot type
 *
 * @param {jQuery} tab -- the tab for the dot type to select
 */
ContinuityContext.prototype._changeTab = function(tab) {
    $(tab).addClass("active")
        .siblings().removeClass("active");

    var continuities = this._panel.find(".continuities");
    $(tab).data("continuities").forEach(function(continuity) {
        continuity.appendTo(continuities);
    });

    // TODO: show continuity errors (dots not make their spot, not enough continuities)
};

/**
 * Updates the panel with information from the currently active
 * sheet
 */
ContinuityContext.prototype._updatePanel = function() {
    var _this = this;
    var tabs = this._panel.find(".dot-types");
    var path = tabs.data("path");
    $.each(this._sheet.getDotTypes(), function(i, dotType) {
        var dot = HTMLBuilder.img(path.replace("DOT_TYPE", dotType));

        HTMLBuilder.make("li.tab", tabs)
            .append(dot)
            .data("continuities", _this._sheet.getContinuities(dotType));
    });

    this._changeTab(this._panel.find(".dot-types li:first"));
};

module.exports = ContinuityContext;
