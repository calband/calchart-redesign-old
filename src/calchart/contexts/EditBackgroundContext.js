import * as _ from "lodash";

import BaseContext from "calchart/contexts/BaseContext";

import { getDimensions } from "utils/MathUtils";

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
                    .data("handle-id", j * 3 + i + 1) // 1-9 like T9 phone
                    .css({
                        left: `calc(${i * 50}% - 5px)`,
                        top: `calc(${j * 50}% - 5px)`,
                    })
                    .appendTo(this._handles);
            });
        });

        this._addEvents(this._handles, "mousedown", e => {
            let [startX, startY] = $(".workspace").makeRelative(e.pageX, e.pageY);
            let isResize = $(e.target).is(".handle");

            let image = this._getImage();
            let oldData = this._getImageData(); // for saveBackground
            
            let id, startWidth, startHeight, deltaX, deltaY;
            if (isResize) {
                id = $(e.target).data("handle-id");
                startWidth = image.width();
                startHeight = image.height();
            } else {
                // maintain offset from top-left corner of image
                let delta = this._handles.makeRelative(e.pageX, e.pageY);
                deltaX = delta[0];
                deltaY = delta[1];
            }

            $(document).on({
                "mousemove.edit-background": e => {
                    let [endX, endY] = $(".workspace").makeRelative(e.pageX, e.pageY);

                    if (isResize) {
                        let deltaX = endX - startX;
                        let deltaY = endY - startY;

                        let data = {};

                        switch (id) {
                            case 1:
                            case 2:
                                if (deltaY > startHeight) {
                                    data.y = startY + startHeight;
                                    data.height = deltaY - startHeight;
                                } else {
                                    data.y = startY + deltaY;
                                    data.height = startHeight - deltaY;
                                }
                                break;
                            case 3:
                            case 4:
                                if (deltaX > startWidth) {
                                    data.x = startX + startWidth;
                                    data.width = deltaX - startWidth;
                                } else {
                                    data.x = startX + deltaX;
                                    data.width = startWidth - deltaX;
                                }
                                break;
                            case 6:
                                if (deltaX < -startWidth) {
                                    data.x = startX + deltaX;
                                    data.width = -deltaX - startWidth;
                                } else {
                                    data.x = startX - startWidth;
                                    data.width = startWidth + deltaX;
                                }
                                break;
                            case 7:
                            case 8:
                                if (deltaY < -startHeight) {
                                    data.y = startY + deltaY;
                                    data.height = -deltaY - startHeight;
                                } else {
                                    data.y = startY - startHeight;
                                    data.height = startHeight + deltaY;
                                }
                                break;
                            case 9:
                        }

                        if (data.width < 0) {
                            data.x += data.width;
                        }

                        this._handles.css({
                            left: data.x,
                            top: data.y,
                            width: data.width,
                            height: data.height,
                        });
                        image.attr("x", data.x)
                            .attr("y", data.y)
                            .attr("width", data.width)
                            .attr("height", data.height);
                    } else {
                        let x = endX - deltaX;
                        let y = endY - deltaY;
                        this._handles.css({
                            left: x,
                            top: y,
                        });
                        image.attr("x", x).attr("y", y);
                    }
                },
                "mouseup.edit-background": e => {
                    this._controller.doAction("saveBackground", [oldData]);
                    $(document).off(".edit-background");
                },
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

        this._controller.loadContext(this._previousContext, {
            unload: false,
        });
    }

    refresh() {
        // if changing stuntsheets, unload context
        if (this._controller.getActiveSheet() !== this._sheet) {
            this.unload();
        } else {
            let image = this._getImage();
            this._handles.css({
                left: image.attr("x"),
                top: image.attr("y"),
                width: image.width(),
                height: image.height(),
            });

            super.refresh();
        }
    }

    refreshZoom() {
        this.refresh();
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
        let scale = this._grapher.getScale();
        let position = scale.toStepCoordinates({
            x: parseInt(image.attr("x")),
            y: parseInt(image.attr("y")),
        });
        return {
            x: position.x,
            y: position.y,
            width: scale.toSteps(image.width()),
            height: scale.toSteps(image.height()),
        };
    }
}

class ContextActions {
    /**
     * Revert all changes made to the background image.
     */
    static revert() {
        // TODO: set initial background data
        // TODO: remove saveBackground actions from undo/redo history
    }

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
            data: [oldData, newData],
            undo: function() {
                this._sheet.saveBackground(oldData);
                this._controller.refresh();
            },
        };
    }
}
