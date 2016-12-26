var BaseContext = require("./BaseContext");
var Continuity = require("calchart/Continuity");
var HTMLBuilder = require("utils/HTMLBuilder");
var JSUtils = require("utils/JSUtils");
var MathUtils = require("utils/MathUtils");
var UIUtils = require("utils/UIUtils");

/**
 * The default editor context, that allows a user to edit dot
 * continuities and step through marching
 */
var ContinuityContext = function(grapher, sheet) {
    this._panel = $(".panel.edit-continuity");

    BaseContext.call(this, grapher, sheet);
};

JSUtils.extends(ContinuityContext, BaseContext);

ContinuityContext.prototype.shortcuts = {
};

ContinuityContext.prototype.load = function() {
    var _this = this;

    this._panel.show();
    this._updatePanel();

    this._addEvents(window, {
        // always keep panel on screen
        resize: function() {
            var panelOffset = _this._panel.offset();
            var panelWidth = _this._panel.outerWidth();
            var panelHeight = _this._panel.outerHeight();
            var panelRight = panelOffset.left + panelWidth;
            var panelBottom = panelOffset.top + panelHeight;

            var windowWidth = $(window).width();
            var windowHeight = $(window).height();

            if (panelRight > windowWidth) {
                _this._panel.css("left", windowWidth - panelWidth);
            }
            if (panelBottom > windowHeight) {
                _this._panel.css("top", windowHeight - panelHeight);
            }
        },
    });
    
    $(".toolbar .edit-continuity").addClass("active");
    $(".toolbar .edit-continuity-group").removeClass("hide");

    this._setupSeek(".toolbar .seek");
};

ContinuityContext.prototype.loadSheet = function(sheet) {
    BaseContext.prototype.loadSheet.call(this, sheet);

    this._updatePanel();
    this._updateSeek();
};

ContinuityContext.prototype.unload = function() {
    this._panel.hide();
    this._removeEvents(window, document, ".toolbar .seek");

    // TODO: set beats to 0

    $(".toolbar .edit-continuity").removeClass("active");
    $(".toolbar .edit-continuity-group").addClass("hide");
};

/**** ACTIONS ****/

/**
 * Increments the beat and updates the seek bar
 */
ContinuityContext.prototype.nextContinuityBeat = function() {
    window.controller.nextBeat();
    this._updateSeek();
};

/**
 * Decrements the beat and updates the seek bar
 */
ContinuityContext.prototype.prevContinuityBeat = function() {
    window.controller.prevBeat();
    this._updateSeek();
};

/**** HELPERS ****/

/**
 * Change the currently active dot type
 *
 * @param {jQuery} tab -- the tab for the dot type to select
 */
ContinuityContext.prototype._changeTab = function(tab) {
    $(tab).addClass("active")
        .siblings().removeClass("active");

    var continuities = this._panel.find(".continuities").empty();
    var dotType = $(tab).data("dotType");
    this._sheet.getContinuities(dotType).forEach(function(continuity) {
        continuity.appendTo(continuities);
    });

    // TODO: show continuity errors (dots not make their spot, not enough continuities)
};

/**
 * Initialize the continuity panel and toolbar
 */
ContinuityContext.prototype._init = function() {
    var _this = this;

    // Continuity panel

    UIUtils.setupPanel(this._panel, {
        bottom: 20,
        right: 20,
    });

    this._panel.on("click", ".tab", function() {
        _this._changeTab(this);
    });

    this._panel
        .find(".add-continuity select")
        .dropdown({
            placeholder_text_single: "Add continuity...",
            disable_search_threshold: false,
            width: "100%",
        })
        .change(function() {
            var continuity = new Continuity($(this).val());
            continuity.appendTo(_this._panel.find(".continuities"));

            var dotType = _this._panel.find(".dot-types li.active").data("dotType");
            _this._sheet.addContinuity(dotType, continuity);

            $(this).val("")
                .trigger("chosen:updated");
        });

    this._panel.on("click", ".continuity .edit", function() {
        var continuity = $(this).parents(".continuity").data("continuity");

        console.log(continuity);
        // TODO: edit continuity popup
    });

    this._panel.on("click", ".continuity .delete", function() {
        var elem = $(this).parents(".continuity");
        var continuity = elem.data("continuity");
        elem.remove();

            var dotType = _this._panel.find(".dot-types li.active").data("dotType");
        _this._sheet.removeContinuity(dotType, continuity);
    });
};

/**
 * Sets up the seek interface in the toolbar
 *
 * @param {jQuery} seek -- the seek interface
 */
ContinuityContext.prototype._setupSeek = function(seek) {
    seek = $(seek);
    var _this = this;
    var isDrag = false;
    var marker = seek.find(".marker");
    var markerWidth = marker.width();
    var seekLeft = seek.offset().left;
    var seekWidth = seek.width();
    var offset = 0;

    var moveMarker = function(pageX) {
        var prev = marker.offset().left;
        var numBeats = _this._sheet.getDuration();
        var interval = seekWidth / (numBeats - 1);

        var x = MathUtils.bound(pageX - seekLeft - offset, 0, seekWidth);
        x = MathUtils.round(x, interval);
        marker.css("transform", "translateX(" + x + "px)");

        if (x !== prev) {
            // TODO: update beat
        }
    };

    this._addEvents(seek, {
        mousedown: function(e) {
            isDrag = true;

            if ($(e.target).is(marker)) {
                offset = e.pageX - marker.offset().left;
            } else {
                // clicking on the seek bar moves the marker there initially
                offset = markerWidth / 2;
                moveMarker(e.pageX);
            }
        },
    });
    this._addEvents(document, {
        mousemove: function(e) {
            if (!isDrag) {
                return;
            }
            moveMarker(e.pageX);
        },
        mouseup: function(e) {
            isDrag = false;
        },
    });
};

/**
 * Updates the panel with information from the currently active
 * sheet
 */
ContinuityContext.prototype._updatePanel = function() {
    var _this = this;
    var tabs = this._panel.find(".dot-types").empty();
    var path = tabs.data("path");

    $.each(this._sheet.getDotTypes(), function(i, dotType) {
        var dot = HTMLBuilder.img(path.replace("DOT_TYPE", dotType));

        HTMLBuilder.make("li.tab", tabs)
            .append(dot)
            .data("dotType", dotType);
    });

    this._changeTab(this._panel.find(".dot-types li:first"));
};

/**
 * Update the seek bar with the current beat
 */
ContinuityContext.prototype._updateSeek = function() {
    var beat = window.controller.getCurrentBeat();
    var numBeats = this._sheet.getDuration();
    var interval = $(".toolbar .seek").width() / (numBeats - 1);

    $(".toolbar .seek .marker").css("transform", "translateX(" + (interval * beat) + "px)");
};

module.exports = ContinuityContext;
