import BaseContext from "calchart/contexts/BaseContext";
import Continuity from "calchart/Continuity";

import { ActionError } from "utils/errors";
import HTMLBuilder from "utils/HTMLBuilder";
import { round } from "utils/MathUtils";
import {
    getData,
    setupPanel,
    showContextMenu,
    showPopup,
} from "utils/UIUtils";

/**
 * The Context that allows a user to edit continuities for dot types
 * and step through marching a Sheet.
 */
export default class ContinuityContext extends BaseContext {
    constructor(controller) {
        super(controller);

        this._panel = this._getPanel();

        // the currently active dot type
        this._dotType = null;

        this._setupPanel();
    }

    static get shortcuts() {
        return ContextShortcuts;
    }

    static get actions() {
        return ContextActions;
    }

    /**
     * @param {Object} options - Options to customize loading the Context:
     *    - {string} [dotType=null] - The dot type to initially load.
     */
    load(options) {
        super.load(options);

        this._panel.show();
        this._dotType = _.defaultTo(options.dotType, null);

        this._addEvents(".workspace", {
            contextmenu: function(e) {
                showContextMenu(e, {
                    "Edit dots...": "loadContext(dot)",
                    "Go to": {
                        "First beat": "firstBeat",
                        "Previous beat": "prevBeat",
                        "Next beat": "nextBeat",
                        "Last beat": "lastBeat",
                    },
                    "Check Continuities...": "checkContinuities(message=true)",
                });
            },
        });

        this._grapher.setOptions({
            showCollisions: true,
        });
        
        $(".toolbar .edit-continuity").addClass("active");
        $(".toolbar .edit-continuity-group").removeClass("hide");

        this._setupSeek();
    }

    unload() {
        super.unload();

        this._panel.hide();
        this._controller.setBeat(0);
        this._controller.deselectDots();

        this._grapher.setOptions({
            showCollisions: false,
        });

        $(".toolbar .edit-continuity").removeClass("active");
        $(".toolbar .edit-continuity-group").addClass("hide");
    }

    refresh() {
        // no Sheets in the show
        if (_.isNull(this._sheet)) {
            this._controller.loadContext("dot");
        } else {
            this._refreshSheet();
        }
    }

    /**
     * Delete the given continuity.
     *
     * @param {(jQuery|int)} continuity - The continuity to delete.
     *   (@see ContinuityContext#_getContinuity)
     */
    deleteContinuity(continuity) {
        continuity = this._getContinuity(continuity);
        this._controller.doAction("removeContinuity", [continuity]);
    }

    /**
     * Edit the given continuity.
     *
     * @param {(jQuery|int)} continuity - The continuity to edit.
     *   (@see ContinuityContext#_getContinuity)
     */
    editContinuity(continuity) {
        continuity = this._getContinuity(continuity);
        let controller = this._controller;
        let html = continuity.popupHTML();

        showPopup("edit-continuity", {
            init: function(popup) {
                popup.addClass(`continuity-${continuity.name}`);

                popup.find(".continuity-title").text(html.name);
                popup.find("form").prepend(html.fields);
                popup.find("select").dropdown();
            },
            onHide: function(popup) {
                popup.removeClassRegex(/^continuity-.*$/);

                popup.find("form .field").remove();
            },
            onSubmit: function(popup) {
                let data = getData(popup);
                continuity.validatePopup(data);
                controller.doAction("saveContinuity", [continuity, data]);
            },
        });
    }

    /**
     * Move the given continuity by the given amount.
     *
     * @param {(jQuery|int)} continuity - The continuity to reorder. (@see
     *   ContinuityContext#_getContinuity)
     * @param {int} delta - The amount to move the continuity by; e.g. delta=1
     *   would put the continuity 1 index later, if possible.
     */
    moveContinuity(continuity, delta) {
        continuity = this._getContinuity(continuity);
        this._controller.doAction("reorderContinuity", [continuity, delta]);
    }

    /**
     * Retrieve the given continuity
     *
     * @param {(jQuery|int)} continuity - The continuity to get, either
     *   the continuity HTML element in the panel, or the index of the
     *   continuity in the panel.
     * @return {Continuity}
     */
    _getContinuity(continuity) {
        if (_.isNumber(continuity)) {
            continuity = this._panel.find(".continuity").get(continuity);
        }
        return $(continuity).data("continuity");
    }

    /**
     * @return {jQuery} The panel to edit continuities
     */
    _getPanel() {
        return $(".panel.edit-continuity");
    }

    /**
     * Update the page according to the state of the Sheet.
     */
    _refreshSheet() {
        // update tabs list in panel
        let tabs = this._panel.find(".dot-types").empty();
        let path = tabs.data("path");
        this._sheet.getDotTypes().forEach(dotType => {
            let dot = HTMLBuilder.img(path.replace("DOT_TYPE", dotType));

            HTMLBuilder.make("li.tab", tabs)
                .addClass(dotType)
                .append(dot)
                .data("dotType", dotType);
        });

        // activate dot type tab
        let tab = tabs.find(`.${this._dotType}`);
        if (!tab.exists()) {
            tab = tabs.find("li.tab:first");
            this._dotType = tab.data("dotType");
        }

        tab.addClass("active");

        let continuities = this._panel.find(".continuities").empty();
        this._sheet.getContinuities(this._dotType).forEach(continuity => {
            let continuityHTML = continuity.panelHTML(this._controller);
            continuities.append(continuityHTML);
        });

        // select dots of the active dot type
        let dots = $(`.dot.${this._dotType}`);
        this._controller.selectDots(dots);

        // update seek bar
        let beat = this._controller.getCurrentBeat();
        let numBeats = this._sheet.getDuration();
        let position = $(".toolbar .seek").width() / numBeats * beat;
        $(".toolbar .seek .marker").css("transform", `translateX(${position}px)`);
    }

    /**
     * Initialize the continuity panel and toolbar
     */
    _setupPanel() {
        let _this = this;

        // setup continuity panel
        setupPanel(this._panel);

        // using custom panel-dropdowns because chosen doesn't render outside of scroll overflow
        this._panel.on("mousedown", "select", function(e) {
            e.preventDefault();

            let select = this;
            let dropdown = HTMLBuilder.make("ul.panel-dropdown", "body");

            $(this).children().each(function() {
                let val = $(this).attr("value");
                let li = HTMLBuilder.li($(this).text())
                    .click(function() {
                        $(select).val(val).change();
                    })
                    .appendTo(dropdown);
            });

            let offset = $(this).offset();
            let selected = $(this).children(":selected");
            // move dropdown so mouse starts on selected option
            offset.top -= selected.index() * dropdown.children(":first").outerHeight();
            dropdown
                .css({
                    top: offset.top,
                    left: offset.left,
                    width: $(this).outerWidth(),
                });

            // make sure dropdown does not go off screen
            let top = dropdown.offset().top;
            if (top < 0) {
                dropdown.css("top", 0);
            }
            let max = $(window).height() - dropdown.outerHeight();
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
                let type = $(this).val();
                _this._controller.doAction("addContinuity", [type]);
                $(this).choose("");
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
            let index = $(this).index();

            showContextMenu(e, {
                "Edit...": `editContinuity(${index})`,
                "Move down": `moveContinuity(${index}, 1)`,
                "Move up": `moveContinuity(${index}, -1)`,
                "Delete": `deleteContinuity(${index})`,
            });
        });
    }

    /**
     * Set up the seek interface in the toolbar.
     */
    _setupSeek() {
        let _this = this;

        let seek = $(".toolbar .seek");
        let isDrag = false;
        let marker = seek.find(".marker");
        let markerWidth = marker.width();
        let seekLeft = seek.offset().left;
        let seekWidth = seek.width();
        let offset = 0;

        function moveMarker(pageX) {
            let prev = marker.offset().left;
            let numBeats = _this._sheet.getDuration();
            let interval = seekWidth / numBeats;

            // snap to beat
            let x = _.clamp(pageX - seekLeft - offset, 0, seekWidth);
            let beat = round(x, interval) / interval;

            // don't redraw screen if the beat didn't change
            if (x !== prev) {
                _this._controller.setBeat(beat);
                _this._controller.refresh();
            }
        }

        this._addEvents(seek, {
            mousedown: function(e) {
                // prevent text highlight
                e.preventDefault();

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
    }
}

let ContextShortcuts = {
    "left": "prevBeat",
    "right": "nextBeat",
    "down": "firstBeat",
    "up": "lastBeat",
    "ctrl+enter": "checkContinuities(fullCheck=true)",
};

class ContextActions {
    /**
     * Add a continuity of the given type to the given sheet for the
     * given dot type.
     *
     * @param {string} type - The type of Continuity to create (@see Continuity).
     * @param {Sheet} [sheet=this._sheet] - The sheet to add continuity to.
     * @param {string} [dotType=this._dotType] - The dot type to add continuity for.
     */
    static addContinuity(type, sheet=this._sheet, dotType=this._dotType) {
        let continuity = Continuity.create(type, sheet, dotType);
        sheet.addContinuity(dotType, continuity);
        this._controller.refresh();

        return {
            data: [type, sheet, dotType],
            undo: function() {
                sheet.removeContinuity(dotType, continuity);
                this._controller.refresh();
            },
        };
    }

    /**
     * Remove the given continuity from the given sheet for the given dot type.
     *
     * @param {Continuity} continuity - The Continuity to remove
     * @param {Sheet} [sheet=this._sheet] - The sheet to remove continuity from.
     * @param {string} [dotType=this._dotType] - The dot type to remove continuity for.
     */
    static removeContinuity(continuity, sheet=this._sheet, dotType=this._dotType) {
        sheet.removeContinuity(dotType, continuity);
        this._controller.refresh();

        return {
            data: [continuity, sheet, dotType],
            undo: function() {
                sheet.addContinuity(dotType, continuity);
                this._controller.refresh();
            },
        };
    }

    /**
     * Reorder the given continuity by the given amount.
     *
     * @param {Continuity} continuity - The continuity to reorder.
     * @param {int} delta - The amount to move the continuity by; e.g. delta=1
     *   would put the continuity 1 index later, if possible.
     * @param {Sheet} [sheet=this._sheet] - The sheet to reorder continuity in.
     * @param {string} [dotType=this._dotType] - The dot type to reorder continuity for.
     */
    static reorderContinuity(continuity, delta, sheet=this._sheet, dotType=this._dotType) {
        let continuities = sheet.getContinuities(dotType);
        let index = continuities.indexOf(continuity);
        let newIndex = index + delta;
        if (index === -1) {
            throw new ActionError("Continuity does not exist!");
        } else if (newIndex < 0 || newIndex >= continuities.length) {
            return false;
        }
        sheet.moveContinuity(dotType, index, newIndex);

        // no need to checkContinuities, since changing order of movements (vectors) doesn't
        // change the cumulative movement (vector)?

        this._controller.refresh();

        return {
            data: [continuity, delta, sheet, dotType],
            undo: function() {
                sheet.moveContinuity(dotType, newIndex, index);
                this._controller.refresh();
            },
        };
    }

    /**
     * Save the given continuity in the given sheet for the given dot type.
     *
     * @param {Continuity} continuity - The Continuity to save.
     * @param {object} data - The data to save.
     * @param {Sheet} [sheet=this._sheet] - The sheet to save continuity for.
     * @param {string} [dotType=this._dotType] - The dot type to save continuity for.
     */
    static saveContinuity(continuity, data, sheet=this._sheet, dotType=this._dotType) {
        let changed = continuity.savePopup(data);

        sheet.updateMovements(dotType);
        this._controller.checkContinuities({
            dots: dotType,
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
    }
}
