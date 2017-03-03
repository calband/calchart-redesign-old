import * as _ from "lodash";

import BaseContext from "calchart/contexts/BaseContext";

/**
 * The Context that allows a user to move and resize the background image
 */
export default class EditBackgroundContext extends BaseContext {
    constructor(controller) {
        super(controller);

        this._previousContext = undefined;
    }

    static get actions() {
        return ContextActions;
    }

    /**
     * @param {Object} options - Options to customize loading the Context:
     *    - {string} [dotType=null] - The dot type to initially load.
     */
    load(options) {
        this._previousContext = options.previousContext;
        this._grapher.setOptions({
            backgroundVisible: true,
        });

        // TODO: save position of image in SVG
        // TODO: move image on top of SVG
        // TODO: add resize handles (style resize and move cursor)

        // TODO: add event on image
        this._addEvents(".workspace", "mousedown", e => {
            // TODO: if on handle, start resizing
            // TODO: else, start moving

            $(document).on({
                "mousemove.edit-background": e => {
                    // TODO: move/resize image
                },
                "mouseup.edit-background": e => {
                    // TODO: saveBackground with background position

                    $(document).off(".edit-background");
                },
            });
        });

        $(".toolbar .edit-background-group").removeClass("hide");
    }

    unload() {
        super.unload();
        this._controller.loadContext(this._previousContext, {
            unload: false,
        });
        this._grapher.setOptions({
            backgroundVisible: false,
        });

        // TODO: remove resize handles
        // TODO: move image back

        $(".toolbar .edit-background-group").addClass("hide");
    }

    refresh() {
        // if changing stuntsheets, unload context
        if (this._controller.getActiveSheet() !== this._sheet) {
            this.unload();
        } else {
            super.refresh();
        }
    }
}

class ContextActions {
    /**
     * TODO
     */
    static revert() {
        // TODO
    }

    /**
     * TODO
     */
    static saveAndQuit() {
        // TODO
    }

    /**
     * Save the background image's position and size after modifying it.
     *
     * @param {Object} [data] - The position/size data. Defaults to the
     *   current position/size.
     * @param {Sheet} [sheet] - The sheet to save background for. Defaults
     *   to the current sheet.
     */
    static saveBackground(data=null, sheet=this._sheet) {
        // TODO
    }
}
