import * as _ from "lodash";

import BaseContext from "calchart/contexts/BaseContext";

/**
 * The Context that allows a user to move and resize the background image
 */
export default class EditBackgroundContext extends BaseContext {
    constructor(controller) {
        super(controller);

        // contains the context that was active before editing background image
        this._previousContext = undefined;

        // contains the div that contains the handles
        this._handles = undefined;
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

        let image = this._grapher.getGraph().find("image.background-image");
        let width = image.width();
        let height = image.height();

        this._handles = $("<div>")
            .addClass("background-image-handles")
            .css({
                left: image.attr("x"),
                top: image.attr("y"),
                width: width,
                height: height,
            })
            .appendTo(".workspace");

        _.range(3).forEach(i => {
            _.range(3).forEach(j => {
                let dir;
                if (i === 1 && j === 1) {
                    // no handle in the middle of the image
                    return;
                } else if (i === 1) {
                    dir = "vertical";
                } else if (j === 1) {
                    dir = "horizontal";
                } else if (i === j) {
                    dir = "nwse";
                } else {
                    dir = "nesw";
                }

                let x = i/2 * width;
                let y = j/2 * height;
                $("<span>")
                    .addClass(`handle ${dir}`)
                    .css({
                        left: x - 5,
                        top: y - 5,
                    })
                    .appendTo(this._handles);
            });
        });

        this._addEvents(this._handles, "mousedown", e => {
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
