/**
 * @fileOverview This file defines the DotContext class, the context
 * used to edit dot positions for a stuntsheet. Functions in this file
 * are organized alphabetically in the following sections:
 *
 * - Constructors (including loading/unloading functions)
 * - Instance methods
 * - Actions (methods that modify the Show)
 * - Helpers (prefixed with an underscore)
 */

var BaseContext = require("./BaseContext");
var Continuity = require("calchart/Continuity");
var errors = require("utils/errors");
var HTMLBuilder = require("utils/HTMLBuilder");
var JSUtils = require("utils/JSUtils");
var MathUtils = require("utils/MathUtils");
var UIUtils = require("utils/UIUtils");

/**** CONSTRUCTORS ****/

/**
 * The default editor context, that allows a user to edit dot
 * continuities and step through marching
 */
var ContinuityContext = function(controller) {
    this._panel = $(".panel.edit-continuity");

    // the currently active dot type
    this._dotType = null;

    BaseContext.call(this, controller);
};

JSUtils.extends(ContinuityContext, BaseContext);

ContinuityContext.prototype.shortcuts = {
    "left": "prevBeat",
    "right": "nextBeat",
    "down": "firstBeat",
    "up": "lastBeat",
    "ctrl+enter": "checkContinuities",
};

ContinuityContext.prototype.load = function(options) {
    var _this = this;

    this._panel.show();
    this._dotType = JSUtils.get(options, "dotType", null);

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
    this._addEvents(".workspace", {
        contextmenu: function(e) {
            UIUtils.showContextMenu(e, {
                "Edit dots...": "loadContext(dot)",
                "Go to": {
                    "First beat": "firstBeat",
                    "Previous beat": "prevBeat",
                    "Next beat": "nextBeat",
                    "Last beat": "lastBeat",
                },
                "Check Continuities...": "checkContinuities",
            });
        },
    });
    
    $(".toolbar .edit-continuity").addClass("active");
    $(".toolbar .edit-continuity-group").removeClass("hide");

    this._setupSeek();
};

ContinuityContext.prototype.unload = function() {
    this._panel.hide();
    this._removeEvents(window, document, ".workspace", ".toolbar .seek");
    this._controller.setBeat(0);
    this._controller.deselectDots();

    $(".toolbar .edit-continuity").removeClass("active");
    $(".toolbar .edit-continuity-group").addClass("hide");
};

/**** INSTANCE METHODS ****/

/**
 * Delete the given continuity.
 *
 * @param {jQuery|int} continuity -- the continuity to delete, either
 *   the continuity HTML element in the panel, or the index of the
 *   continuity in the panel.
 */
ContinuityContext.prototype.deleteContinuity = function(continuity) {
    if (typeof continuity === "number") {
        continuity = this._panel.find(".continuity").get(continuity);
    }

    continuity = $(continuity).data("continuity");
    this._controller.doAction("removeContinuity", [continuity]);
};

/**
 * Edit the given continuity.
 *
 * @param {jQuery|int} continuity -- the continuity to edit, either
 *   the continuity HTML element in the panel, or the index of the
 *   continuity in the panel.
 */
ContinuityContext.prototype.editContinuity = function(continuity) {
    if (typeof continuity === "number") {
        continuity = this._panel.find(".continuity").get(continuity);
    }

    continuity = $(continuity).data("continuity");
    var controller = this._controller;
    var html = continuity.popupHTML();

    UIUtils.showPopup("edit-continuity", {
        init: function(popup) {
            popup.find(".continuity-title").text(html.name);
            popup.find("form").prepend(html.fields);
            popup.find("select").dropdown();
        },
        onHide: function(popup) {
            popup.find("form .field").remove();
        },
        onSubmit: function(popup) {
            var data = UIUtils.getData(popup);
            controller.doAction("saveContinuity", [continuity, data]);
            UIUtils.hidePopup();
        },
    });
};

ContinuityContext.prototype.refresh = function() {
    BaseContext.prototype.refresh.call(this);

    if (this._sheet === null) {
        return;
    }

    // update tabs list in panel
    var tabs = this._panel.find(".dot-types").empty();
    var path = tabs.data("path");
    $.each(this._sheet.getDotTypes(), function(i, dotType) {
        var dot = HTMLBuilder.img(path.replace("DOT_TYPE", dotType));

        HTMLBuilder.make("li.tab", tabs)
            .addClass(dotType)
            .append(dot)
            .data("dotType", dotType);
    });

    // activate dot type tab
    if (this._dotType === null) {
        this._dotType = tabs.find("li.tab:first").data("dotType");
    }
    var tab = tabs.find("." + this._dotType).addClass("active");
    var continuities = this._panel.find(".continuities").empty();
    this._sheet.getContinuities(this._dotType).forEach(function(continuity) {
        var continuityHTML = continuity.panelHTML(this._controller);
        continuities.append(continuityHTML);
    }, this);

    // select dots of the active dot type
    var dots = $(".dot." + this._dotType);
    this._controller.selectDots(dots, {
        append: false
    });

    // update seek bar
    var beat = this._controller.getCurrentBeat();
    var numBeats = this._sheet.getDuration();
    var interval = $(".toolbar .seek").width() / numBeats;
    $(".toolbar .seek .marker").css("transform", "translateX(" + (interval * beat) + "px)");
};

/**** ACTIONS ****/

var ContextActions = {};

/**
 * Adds a continuity of the given type to the given sheet for the
 * given dot type
 *
 * @param {string} type -- the type of Continuity to create (see
 *   calchart/Continuity)
 * @param {Sheet|undefined} sheet -- the sheet to add continuity to,
 *   defaults to the currently active sheet
 * @param {string|undefined} dotType -- the dot type to add continuity
 *   for, defaults to the currently active dot type
 */
ContextActions.addContinuity = function(type, sheet, dotType) {
    sheet = sheet || this._sheet;
    dotType = dotType || this._dotType;

    var continuity = Continuity.create(type, sheet, dotType);
    sheet.addContinuity(dotType, continuity);
    this._controller.refresh();

    return {
        data: [type, sheet, dotType],
        undo: function() {
            sheet.removeContinuity(dotType, continuity);
            this._controller.refresh();
        },
    };
};

/**
 * Saves the given continuity in the given sheet for the given dot type
 *
 * @param {Continuity} continuity -- the Continuity to save
 * @param {object} data -- the data to save
 * @param {Sheet|undefined} sheet -- the sheet to add continuity to,
 *   defaults to the currently active sheet
 * @param {string|undefined} dotType -- the dot type to add continuity
 *   for, defaults to the currently active dot type
 */
ContextActions.saveContinuity = function(continuity, data, sheet, dotType) {
    sheet = sheet || this._sheet;
    dotType = dotType || this._dotType;

    try {
        var changed = continuity.savePopup(data);
    } catch (e) {
        if (e instanceof errors.ValidationError) {
            UIUtils.showError(e.message);
            return;
        } else {
            throw e;
        }
    }

    sheet.updateMovements(dotType);
    this._controller.checkContinuities({
        dots: dotType,
        quiet: true,
    });
    this._controller.refresh();

    return {
        data: [continuity, data, sheet, dotType],
        undo: function() {
            continuity.savePopup(changed);
            sheet.updateMovements(dotType);
            this._controller.refresh();
        },
    };
};

/**
 * Removes the given continuity from the given sheet for the given dot type
 *
 * @param {Continuity} continuity -- the Continuity to remove
 * @param {Sheet|undefined} sheet -- the sheet to remove continuity from,
 *   defaults to the currently active sheet
 * @param {string|undefined} dotType -- the dot type to remove continuity
 *   for, defaults to the currently active dot type
 */
ContextActions.removeContinuity = function(continuity, sheet, dotType) {
    sheet = sheet || this._sheet;
    dotType = dotType || this._dotType;

    sheet.removeContinuity(dotType, continuity);
    this._controller.refresh();

    return {
        data: [continuity, sheet, dotType],
        undo: function() {
            sheet.addContinuity(dotType, continuity);
            this._controller.refresh();
        },
    };
};

ContinuityContext.prototype.actions = ContextActions;

/**** HELPERS ****/

/**
 * Initialize the continuity panel and toolbar
 */
ContinuityContext.prototype._init = function() {
    var _this = this;

    // setup continuity panel
    UIUtils.setupPanel(this._panel, {
        bottom: 20,
        right: 20,
    });

    // different dropdowns; chosen doesn't render outside of scroll overflow
    this._panel.on("mousedown", "select", function(e) {
        e.preventDefault();

        var select = this;
        var dropdown = HTMLBuilder.make("ul.panel-dropdown", "body");

        $(this).children().each(function() {
            var val = $(this).attr("value");
            var li = HTMLBuilder.li($(this).text())
                .click(function() {
                    $(select).val(val).change();
                })
                .appendTo(dropdown);
        });

        var offset = $(this).offset();
        var selected = $(this).children(":selected");
        // move dropdown so mouse starts on selected option
        offset.top -= selected.index() * dropdown.children(":first").outerHeight();
        dropdown
            .css({
                top: offset.top,
                left: offset.left,
                width: $(this).outerWidth(),
            });

        // make sure dropdown does not go off screen
        var top = dropdown.offset().top;
        if (top < 0) {
            dropdown.css("top", 0);
        }
        var max = $(window).height() - dropdown.outerHeight();
        if (top > max) {
            dropdown.css("top", max);
        }

        $(window).click(function(e) {
            $(dropdown).remove();
            $(this).off(e);
        });
    });

    // changing tabs
    this._panel.on("click", ".tab", function() {
        _this._dotType = $(this).data("dotType");
        _this.refresh();
    });

    // add continuity dropdown
    this._panel
        .find(".add-continuity select")
        .dropdown({
            placeholder_text_single: "Add continuity...",
            disable_search_threshold: false,
        })
        .change(function() {
            var type = $(this).val();
            _this._controller.doAction("addContinuity", [type]);
            $(this).val("").trigger("chosen:updated");
        });

    // edit continuity popup
    this._panel.on("click", ".continuity .edit", function() {
        _this.editContinuity($(this).parents(".continuity"));
    });

    // remove continuity link
    this._panel.on("click", ".continuity .delete", function() {
        _this.deleteContinuity($(this).parents(".continuity"));
    });

    // context menus
    this._panel.on("contextmenu", ".continuity", function(e) {
        var index = $(this).index();

        UIUtils.showContextMenu(e, {
            "Edit...": "editContinuity(" + index + ")",
            "Delete": "deleteContinuity(" + index + ")",
        });
    });
};

/**
 * Sets up the seek interface in the toolbar. Adds events to ".toolbar .seek"
 * and document.
 */
ContinuityContext.prototype._setupSeek = function() {
    seek = $(".toolbar .seek");
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
        var interval = seekWidth / numBeats;

        // snap to beat
        var x = MathUtils.bound(pageX - seekLeft - offset, 0, seekWidth);
        var beat = MathUtils.round(x, interval) / interval;

        // don't redraw screen if the beat didn't change
        if (x !== prev) {
            _this._controller.setBeat(beat);
            _this._controller.refresh();
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

module.exports = ContinuityContext;
