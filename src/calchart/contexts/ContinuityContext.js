import GraphContext from "calchart/contexts/GraphContext";
import Continuity from "calchart/Continuity";
import DotType from "calchart/DotType";

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
export default class ContinuityContext extends GraphContext {
    constructor(controller) {
        super(controller);

        // the currently active dot type
        this._dotType = null;

        // track the current beat
        this._currBeat = 0;

        this._setupPanel();
    }

    static get shortcuts() {
        return _.extend({}, super.shortcuts, ContextShortcuts);
    }

    static get actions() {
        return ContextActions;
    }

    static get info() {
        return {
            name: "continuity",
            html: "edit-continuity",
        };
    }

    static get refreshTargets() {
        return super.refreshTargets.concat(["panel"]);
    }

    get panel() {
        return $(".panel.edit-continuity");
    }

    /**
     * @param {Object} options - Options to customize loading the Context:
     *    - {string} [dotType=null] - The dot type to initially load.
     */
    load(options) {
        super.load(options);

        this.panel.show();
        this._dotType = _.defaultTo(options.dotType, null);

        this._addEvents(this.workspace, {
            contextmenu: function(e) {
                showContextMenu(e, {
                    "Edit dots...": "loadContext(dot)",
                    "Go to": {
                        "First beat": "firstBeat",
                        "Previous beat": "prevBeat",
                        "Next beat": "nextBeat",
                        "Last beat": "lastBeat",
                    },
                    "Check Continuities...": "checkContinuities(fullCheck=true)",
                });
            },
        });

        this.grapher.setOptions({
            showCollisions: true,
        });

        this._setupSeek();
    }

    unload() {
        super.unload();

        this.panel.hide();
        this.deselectDots();

        this.grapher.setOptions({
            showCollisions: false,
        });
    }

    refresh(...targets) {
        // if no Sheets in the show, load dot context
        if (_.isNull(this.activeSheet)) {
            this.controller.loadContext("dot");
        } else {
            super.refresh(...targets);
        }
    }

    refreshGrapher() {
        super.refreshGrapher();

        let numBeats = this.activeSheet.getDuration();
        let position = $(".toolbar .seek").width() / numBeats * this._currBeat;
        $(".toolbar .seek .marker").css("transform", `translateX(${position}px)`);
    }

    /**
     * Refresh the continuities panel
     */
    refreshPanel() {
        // update tabs list in panel
        let tabs = this.panel.find(".dot-types").empty();
        let path = tabs.data("path");
        this.activeSheet.getDotTypes().forEach(dotType => {
            let tab = HTMLBuilder.make("li.tab")
                .addClass(dotType)
                .data("dotType", dotType)
                .appendTo(tabs);

            if (DotType.isAll(dotType)) {
                tab.text("All");
            } else {
                let icon = HTMLBuilder.img(path.replace("DOT_TYPE", dotType));
                tab.append(icon);
            }
        });

        // activate dot type tab
        let tab = tabs.find(`.${this._dotType}`);
        if (!tab.exists()) {
            tab = tabs.find("li.tab:first");
            this._dotType = tab.data("dotType");
        }

        tab.addClass("active");

        let continuities = this.activeSheet.getContinuities(this._dotType);
        this._populatePanel(continuities);

        // select dots of the active dot type
        let dots = $(`.dot.${this._dotType}`);
        this.selectDots(dots);
    }

    /**** METHODS ****/

    /**
     * Delete the given continuity.
     *
     * @param {(jQuery|int)} continuity - The continuity to delete.
     *   (@see ContinuityContext#_getContinuity)
     */
    deleteContinuity(continuity) {
        continuity = this._getContinuity(continuity);
        this.controller.doAction("removeContinuity", [continuity]);
    }

    /**
     * Edit the given continuity.
     *
     * @param {(jQuery|int)} continuity - The continuity to edit.
     *   (@see ContinuityContext#_getContinuity)
     */
    editContinuity(continuity) {
        continuity = this._getContinuity(continuity);
        let contents = continuity.getPopup();

        showPopup("edit-continuity", {
            init: popup => {
                popup.addClass(`continuity-${continuity.info.name}`);

                popup.find(".continuity-title").text(continuity.info.name);
                popup.find("form").prepend(contents);
                popup.find("select").dropdown();
            },
            onHide: popup => {
                popup.removeClassRegex(/^continuity-.*$/);

                popup.find("form .field").remove();
            },
            onSubmit: popup => {
                let data = getData(popup);
                continuity.validatePopup(data);
                this.controller.doAction("saveContinuity", [continuity, data]);
            },
        });
    }

    /**
     * Go to the zero-th beat of the sheet.
     */
    firstBeat() {
        this._currBeat = 0;
        this.refresh("grapher");
    }

    getCurrentBeat() {
        return this._currBeat;
    }

    /**
     * Go to the last beat of the sheet.
     */
    lastBeat() {
        this._currBeat = this.activeSheet.getDuration();
        this.refresh("grapher");
    }

    loadSheet(sheet) {
        this._currBeat = 0;
        super.loadSheet(sheet);
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
        this.controller.doAction("reorderContinuity", [continuity, delta]);
    }

    /**
     * Increment the current beat.
     */
    nextBeat() {
        if (this._currBeat < this.activeSheet.getDuration()) {
            this._currBeat++;
            this.refresh("grapher");
        }
    }

    /**
     * Decrement the current beat.
     */
    prevBeat() {
        if (this._currBeat > 0) {
            this._currBeat--;
            this.refresh("grapher");
        }
    }

    /**** HELPERS ****/

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
            continuity = this.panel.find(".continuity").get(continuity);
        }
        return $(continuity).data("continuity");
    }

    /**
     * Populate the panel with the given continuities.
     *
     * @param {Continuity[]} continuities
     */
    _populatePanel(continuities) {
        let $continuities = this.panel.find(".continuities").empty();

        // action icons
        let iconEdit = HTMLBuilder.icon("pencil", "edit");
        let iconDelete = HTMLBuilder.icon("times", "delete");
        let actions = HTMLBuilder.div("actions", [iconEdit, iconDelete]);

        continuities.forEach(continuity => {
            let label = HTMLBuilder.span(continuity.info.label);
            let contents = continuity.getPanel(this.controller);
            contents = [label].concat(contents);

            let info = HTMLBuilder.div("info", contents);

            let classes = `continuity ${continuity.info.type}`;

            HTMLBuilder.div(classes, [info, actions.clone()])
                .data("continuity", continuity)
                .appendTo($continuities);
        });
    }

    /**
     * Initialize the continuity panel and toolbar
     */
    _setupPanel() {
        // setup continuity panel
        setupPanel(this.panel);

        // using custom panel-dropdowns because chosen doesn't render outside of scroll overflow
        this.panel.on("mousedown", "select", function(e) {
            e.preventDefault();

            let select = this;
            let dropdown = HTMLBuilder.make("ul.panel-dropdown").appendTo("body");

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

            $(window).one("click", function(e) {
                $(dropdown).remove();
            });
        });

        // changing tabs
        this.panel.on("click", ".tab", e => {
            this._dotType = $(e.currentTarget).data("dotType");
            this.refresh("panel");
        });

        // add continuity dropdown
        this.panel
            .find(".add-continuity select")
            .dropdown({
                placeholder_text_single: "Add continuity...",
                disable_search_threshold: false,
            })
            .change(e => {
                let type = $(e.currentTarget).val();
                this.controller.doAction("addContinuity", [type]);
                $(e.currentTarget).choose("");
            });

        // edit continuity popup
        this.panel.on("click", ".continuity .edit", e => {
            let continuity = $(e.currentTarget).parents(".continuity");
            this.editContinuity(continuity);
        });

        // remove continuity link
        this.panel.on("click", ".continuity .delete", e => {
            let continuity = $(e.currentTarget).parents(".continuity");
            this.deleteContinuity(continuity);
        });

        // context menus
        this.panel.on("contextmenu", ".continuity", function(e) {
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
        let seek = $(".toolbar .seek");
        let marker = seek.find(".marker");
        let markerRadius = marker.width() / 2;
        let seekLeft = seek.offset().left;
        let seekWidth = seek.width();

        let updateSeek = e => {
            let prev = marker.offset().left;
            let numBeats = this.activeSheet.getDuration();
            let interval = seekWidth / numBeats;

            // snap to beat
            let x = _.clamp(e.pageX - seekLeft - markerRadius, 0, seekWidth);

            // don't redraw screen if the beat didn't change
            if (x !== prev) {
                this._currBeat = round(x, interval) / interval;
                this.refresh("grapher");
            }
        };

        this._addEvents(seek, {
            mousedown: function(e) {
                // prevent text highlight
                e.preventDefault();
                updateSeek(e);

                $(document).on({
                    "mousemove.seek": updateSeek,
                    "mouseup.seek": e => {
                        $(document).off(".seek");
                    },
                });
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

class ContextActions extends GraphContext.actions {
    /**
     * Add a continuity of the given type to the given sheet for the
     * given dot type.
     *
     * @param {string} type - The type of Continuity to create (@see Continuity).
     * @param {Sheet} [sheet=this.activeSheet] - The sheet to add continuity to.
     * @param {string} [dotType=this._dotType] - The dot type to add continuity for.
     */
    static addContinuity(type, sheet=this.activeSheet, dotType=this._dotType) {
        let continuity = Continuity.create(type, sheet, dotType);
        sheet.addContinuity(dotType, continuity);
        this.refresh("grapher", "panel");

        return {
            data: [type, sheet, dotType],
            undo: function() {
                sheet.removeContinuity(dotType, continuity);
                this.refresh("grapher", "panel");
            },
        };
    }

    /**
     * Remove the given continuity from the given sheet for the given dot type.
     *
     * @param {Continuity} continuity - The Continuity to remove
     * @param {Sheet} [sheet=this.activeSheet] - The sheet to remove continuity from.
     * @param {string} [dotType=this._dotType] - The dot type to remove continuity for.
     */
    static removeContinuity(continuity, sheet=this.activeSheet, dotType=this._dotType) {
        sheet.removeContinuity(dotType, continuity);
        this.refresh("grapher", "panel");

        return {
            data: [continuity, sheet, dotType],
            undo: function() {
                sheet.addContinuity(dotType, continuity);
                this.refresh("grapher", "panel");
            },
        };
    }

    /**
     * Reorder the given continuity by the given amount.
     *
     * @param {Continuity} continuity - The continuity to reorder.
     * @param {int} delta - The amount to move the continuity by; e.g. delta=1
     *   would put the continuity 1 index later, if possible.
     * @param {Sheet} [sheet=this.activeSheet] - The sheet to reorder continuity in.
     * @param {string} [dotType=this._dotType] - The dot type to reorder continuity for.
     */
    static reorderContinuity(continuity, delta, sheet=this.activeSheet, dotType=this._dotType) {
        let continuities = sheet.getContinuities(dotType);
        let index = continuities.indexOf(continuity);
        let newIndex = index + delta;
        if (index === -1) {
            throw new ActionError("Continuity does not exist!");
        } else if (newIndex < 0 || newIndex >= continuities.length) {
            return false;
        }

        sheet.moveContinuity(dotType, index, newIndex);
        this.checkContinuities(sheet, dotType);
        this.refresh("grapher", "panel");

        return {
            data: [continuity, delta, sheet, dotType],
            undo: function() {
                sheet.moveContinuity(dotType, newIndex, index);
                this.refresh("grapher", "panel");
            },
        };
    }

    /**
     * Save the given continuity in the given sheet for the given dot type.
     *
     * @param {Continuity} continuity - The Continuity to save.
     * @param {object} data - The data to save.
     * @param {Sheet} [sheet=this.activeSheet] - The sheet to save continuity for.
     * @param {string} [dotType=this._dotType] - The dot type to save continuity for.
     */
    static saveContinuity(continuity, data, sheet=this.activeSheet, dotType=this._dotType) {
        let changed = continuity.savePopup(data);

        sheet.updateMovements(dotType);
        this.checkContinuities(sheet, dotType);
        this.refresh("grapher", "panel");

        return {
            data: [continuity, data, sheet, dotType],
            undo: function() {
                continuity.savePopup(changed);
                sheet.updateMovements(dotType);
                this.refresh("grapher", "panel");
            },
        };
    }
}
