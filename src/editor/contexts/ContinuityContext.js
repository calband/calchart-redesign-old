import Continuity from "calchart/Continuity";
import DotType from "calchart/DotType";
import GraphContext from "editor/contexts/GraphContext";
import ContinuityPanel from "panels/ContinuityPanel";

import { ActionError } from "utils/errors";
import HTMLBuilder from "utils/HTMLBuilder";
import { underscoreKeys, update } from "utils/JSUtils";
import { round } from "utils/MathUtils";
import { showContextMenu } from "utils/UIUtils";

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

    get panel() {
        return ContinuityPanel;
    }

    /**
     * @param {Object} options - Options to customize loading the Context:
     *    - {string} [dotType=null] - The dot type to initially load.
     */
    load(options) {
        super.load(options);

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

    /**** METHODS ****/

    /**
     * Delete the given continuity.
     *
     * @param {(jQuery|int)} continuity - The continuity to delete.
     *   (@see ContinuityPanel.getContinuity)
     */
    deleteContinuity(continuity) {
        continuity = this._panel.getContinuity(continuity);
        this.controller.doAction("removeContinuity", [continuity]);
    }

    /**
     * Edit the given continuity.
     *
     * @param {(jQuery|int)} continuity - The continuity to edit.
     *   (@see ContinuityPanel.getContinuity)
     */
    editContinuity(continuity) {
        continuity = this._panel.getContinuity(continuity);
        let PopupClass = continuity.constructor.popupClass;
        new PopupClass(this.controller, continuity).show();
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

    getDotType() {
        return this._dotType;
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
     *   ContinuityPanel.getContinuity)
     * @param {int} delta - The amount to move the continuity by; e.g. delta=1
     *   would put the continuity 1 index later, if possible.
     */
    moveContinuity(continuity, delta) {
        continuity = this._panel.getContinuity(continuity);
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

    setDotType(dotType) {
        this._dotType = dotType;
    }

    /**** HELPERS ****/

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
        let changed = update(continuity, underscoreKeys(data));

        sheet.updateMovements(dotType);
        this.checkContinuities(sheet, dotType);
        this.refresh("grapher", "panel");

        return {
            data: [continuity, data, sheet, dotType],
            undo: function() {
                update(continuity, changed);
                sheet.updateMovements(dotType);
                this.refresh("grapher", "panel");
            },
        };
    }
}
