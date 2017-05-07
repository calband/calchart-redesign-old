import HiddenContext from "calchart/contexts/HiddenContext";

import { getDimensions } from "utils/MathUtils";

/**
 * The Context that allows a user to move and resize the background image
 */
export default class EditBackgroundContext extends HiddenContext {
    constructor(controller) {
        super(controller);

        // tracks how many times load has been called, to distinguish
        // sessions of editing backgrounds
        this._session = 0;

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
        super.load(options);

        this._session++;
        this._previousContext = options.previousContext;
        this._grapher.setOptions({
            backgroundVisible: true,
        });

        this._handles = $("<div>")
            .addClass("background-image-handles")
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

                $("<span>")
                    .addClass(`handle ${dir}`)
                    .data("handle-id", j * 3 + i) // 0-8 like T9 phone minus 1
                    .css({
                        left: `calc(${i * 50}% - 5px)`,
                        top: `calc(${j * 50}% - 5px)`,
                    })
                    .appendTo(this._handles);
            });
        });

        this._addEvents(this._handles, "mousedown", e => {
            // for saveBackground
            let oldData = this._getImageData();

            let mousemove = $(e.target).is(".handle")
                ? this.mousedownResize(e)
                : this.mousedownMove(e);

            $(document).on({
                "mousemove.edit-background": mousemove,
                "mouseup.edit-background": e => {
                    this._controller.doAction("saveBackground", [oldData]);
                    $(document).off(".edit-background");
                }
            });
        });

        $(".toolbar .edit-background-group").removeClass("hide");
    }

    unload() {
        super.unload();
        this._grapher.setOptions({
            backgroundVisible: false,
        });

        this._handles.remove();

        $(".toolbar .edit-background-group").addClass("hide");
    }

    refresh() {
        let image = this._getImage();
        let dimensions = image[0].getBBox();

        this._handles.css({
            left: image.attr("x"),
            top: image.attr("y"),
            width: dimensions.width,
            height: dimensions.height,
        });
    }

    exit() {
        this._controller.loadContext(this._previousContext);
    }

    /**
     * Handle the mousedown event on the image, to move the image.
     *
     * @param {Event} e
     * @return {Function}
     */
    mousedownMove(e) {
        let image = this._getImage();
        let [deltaX, deltaY] = this._handles.makeRelative(e.pageX, e.pageY);

        return e => {
            let [endX, endY] = $(".workspace").makeRelative(e.pageX, e.pageY);
            let x = endX - deltaX;
            let y = endY - deltaY;

            this._handles.css({
                left: x,
                top: y,
            });
            image.attr("x", x).attr("y", y);
        };
    }

    /**
     * Handle the mousedown event on a handle, to resize the image.
     *
     * @param {Event} e
     * @return {Function}
     */
    mousedownResize(e) {
        let image = this._getImage();

        let [startX, startY] = $(".workspace").makeRelative(e.pageX, e.pageY);
        let startWidth = image.width();
        let startHeight = image.height();
        let ratio = startWidth / startHeight;

        let id = $(e.target).data("handle-id");
        let div = Math.floor(id / 3);
        let mod = id % 3;
        // multipliers to make math work
        if (id % 8 !== 0) {
            ratio *= -1;
        }
        if (mod !== 0) {
            startWidth *= -1;
        }
        if (div !== 0) {
            startHeight *= -1;
        }

        return e => {
            let [endX, endY] = $(".workspace").makeRelative(e.pageX, e.pageY);
            let deltaX = endX - startX;
            let deltaY = endY - startY;

            // diagonal handles
            if (id % 2 === 0) {
                if (deltaX > deltaY * ratio) {
                    deltaX = deltaY * ratio;
                } else {
                    deltaY = deltaX / ratio;
                }
            }

            // handles to change width
            if (mod !== 1) {
                let x, width;
                if (deltaX > startWidth) {
                    x = startX + startWidth;
                    width = deltaX - startWidth;
                } else {
                    x = startX + deltaX;
                    width = startWidth - deltaX;
                }
                this._handles.css({
                    left: x,
                    width: width,
                });
                image.attr("x", x).attr("width", width);
            }

            // handles to change height
            if (div !== 1) {
                let y, height;
                if (deltaY > startHeight) {
                    y = startY + startHeight;
                    height = deltaY - startHeight;
                } else {
                    y = startY + deltaY;
                    height = startHeight - deltaY;
                }
                this._handles.css({
                    top: y,
                    height: height,
                });
                image.attr("y", y).attr("height", height);
            }
        };
    }

    /**
     * Revert all changes made to the background image.
     */
    revert() {
        this._controller.revertWhile(action => {
            return action.session === this._session;
        });
        this.exit();
    }

    /**
     * @return {jQuery} the background image
     */
    _getImage() {
        return this._grapher.getGraph().find("image.background-image");
    }

    /**
     * @return {Object} data of the background image to pass to
     *   Sheet.saveBackground
     */
    _getImageData() {
        let image = this._getImage();
        let dimensions = image[0].getBBox();
        let scale = this._grapher.getScale();
        let position = scale.toStepCoordinates({
            x: parseInt(image.attr("x")),
            y: parseInt(image.attr("y")),
        });
        return {
            x: position.x,
            y: position.y,
            width: scale.toSteps(dimensions.width),
            height: scale.toSteps(dimensions.height),
        };
    }
}

class ContextActions {
    /**
     * Save the background image's position and size after modifying it.
     *
     * @param {Object} oldData - The previous position/size of the image
     * @param {Object} [newData] - The position/size to save for the
     *   image. Defaults to the current position/size of the image.
     */
    static saveBackground(oldData, newData) {
        if (_.isUndefined(newData)) {
            newData = this._getImageData();
        }

        this._sheet.saveBackground(newData);
        this._controller.refresh();

        return {
            session: this._session,
            data: [oldData, newData],
            undo: function() {
                this._sheet.saveBackground(oldData);
                this._controller.refresh();
            },
        };
    }
}
