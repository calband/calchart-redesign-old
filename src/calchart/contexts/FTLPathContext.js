import BaseContext from "calchart/contexts/BaseContext";
import Coordinate from "calchart/Coordinate";

import HTMLBuilder from "utils/HTMLBuilder";
import { round } from "utils/MathUtils";
import { setupPanel } from "utils/UIUtils";

/**
 * The Context that allows a user to define the path in
 * a follow the leader continuity.
 */
export default class FTLPathContext extends BaseContext {
    constructor(controller) {
        super(controller);

        this._panel = $(".panel.ftl-path");
        this._list = this._panel.find(".ftl-path-points");
        this._setupPanel();

        // FollowLeaderContinuity
        this._continuity = null;

        // selection, add-point, remove-point
        this._activeTool = null;

        this._svg = this._grapher.getSVG();
        this._path = null;
    }

    static get actions() {
        return ContextActions;
    }

    /**
     * @param {Object} options - Options to customize loading the Context:
     *    - {FollowLeaderContinuity} continuity - The FTL continuity being edited
     */
    load(options) {
        this._continuity = options.continuity;

        this.loadTool("selection");

        let path = this._svg.append("path").classed("ftl-path-helper", true);
        this._path = $.fromD3(path);

        this._panel.show();
        $(".toolbar .ftl-path-group").removeClass("hide");

        let scale = this._grapher.getScale();
        this._addEvents(".workspace", {
            mousedown: e => {
                if (this._activeTool === "selection" && $(e.target).is(".ref-point")) {
                    let point = $(e.target);
                    $(".workspace").on({
                        "mousemove.ftl-path-move-point": e => {
                            let steps = this._eventToSnapSteps(e);
                            let coord = scale.toDistanceCoordinates(steps);
                            point.attr("cx", coord.x).attr("cy", coord.y);
                        },
                        "mouseup.ftl-path-move-point": e => {
                            let coordinate = this._eventToSnapSteps(e);
                            let index = point.data("index");
                            this._controller.doAction("movePoint", [index, coordinate]);
                            $(".workspace").off(".ftl-path-move-point");
                        },
                    });
                }
            },
            click: e => {
                let coord = this._eventToSnapSteps(e);
                switch (this._activeTool) {
                    case "add-point":
                        this._controller.doAction("addPoint", [coord.x, coord.y]);
                        break;
                    case "remove-point":
                        let point = $(e.target);
                        if (point.is(".ref-point")) {
                            this._controller.doAction("removePoint", [point.data("index")]);
                        }
                        break;
                }
            },
        })
    }

    unload() {
        super.unload();

        // remove helpers
        this._svg.selectAll(".ref-point").remove();
        this._path.remove();

        this._panel.hide();
        $(".toolbar .ftl-path-group").addClass("hide");

        this._grapher.getDots(this._continuity.order).css("opacity", "");
        this._controller.loadContext("continuity", {
            unload: false,
            dotType: this._continuity.dotType,
        });
    }

    refresh() {
        super.refresh();

        // highlight first dot in path
        let dot = this._grapher.getDot(this._continuity.order[0]);
        this._grapher.selectDots(dot);
        this._grapher.getDots(this._continuity.order).css("opacity", 1);

        this._list.empty();
        this._svg.selectAll(".ref-point").remove();
        let scale = this._grapher.getScale();
        let dotRadius = scale.toDistance(3/4);

        let start = this._sheet.getDotInfo(dot.data("dot")).position;
        let startScaled = scale.toDistanceCoordinates(start);
        let pathDef = `M ${startScaled.x} ${startScaled.y}`;
        let prevPoint = startScaled;

        // populate panel and add reference points to SVG
        this._continuity.path.forEach((coordinate, i) => {
            let point = this._svg.append("circle")
                .classed("ref-point", true)
                .attr("r", dotRadius);

            // reference points know their order
            $.fromD3(point).data("index", i);

            let scaled = scale.toDistanceCoordinates(coordinate);
            point.attr("cx", scaled.x).attr("cy", scaled.y);
            if (prevPoint.x !== scaled.x && prevPoint.y !== scaled.y) {
                let deltaX = scaled.x - prevPoint.x;
                let deltaY = scaled.y - prevPoint.y;
                let delta = Math.min(Math.abs(deltaX), Math.abs(deltaY));
                deltaX = Math.sign(deltaX) * delta;
                deltaY = Math.sign(deltaY) * delta;
                pathDef += ` L ${prevPoint.x + deltaX} ${prevPoint.y + deltaY}`;
            }
            pathDef += ` L ${scaled.x} ${scaled.y}`;
            prevPoint = scaled;

            let label = `(${coordinate.x}, ${coordinate.y})`;
            let li = HTMLBuilder.li(label, "point")
                .data("coordinate", coordinate)
                .appendTo(this._list)
                .mouseenter(e => {
                    point.classed("highlight", true);
                })
                .mouseleave(e => {
                    point.classed("highlight", false);
                });;
        });

        this._list.sortable({
            containment: this._panel,
            update: () => {
                let path = this._list.children().map(function() {
                    return $(this).data("coordinate");
                }).get();
                controller.doAction("setPath", [path]);
            },
        });

        this._path.attr("d", pathDef);

        this._panel.keepOnscreen();
    }

    /**
     * Load the given editing tool.
     *
     * @param {string} name
     */
    loadTool(name) {
        this._activeTool = name;

        $(".workspace").off(".ftl-path-add-point");
        let helper = this._svg.select(".ftl-path-add-point");
        if (name === "add-point") {
            // add helper dot
            let scale = this._grapher.getScale();
            let dotRadius = scale.toDistance(3/4);
            $(".workspace").on("mousemove.ftl-path-add-point", e => {
                let steps = this._eventToSnapSteps(e);
                let coord = scale.toDistanceCoordinates(steps);

                if (helper.empty()) {
                    helper = this._svg.append("circle")
                        .classed("ftl-path-add-point", true)
                        .attr("r", dotRadius);
                }
                helper.attr("cx", coord.x).attr("cy", coord.y);
            });
        } else {
            helper.remove();
        }

        $(".toolbar .ftl-path-group li").removeClass("active");
        $(`.toolbar .ftl-path-group .${name}`).addClass("active");
    }

    _setupPanel() {
        setupPanel(this._panel);

        this._panel.find("button.submit").click(() => {
            this.unload();
        });
    }

    /**
     * Convert a MouseEvent into a coordinate for the current mouse position,
     * rounded to the nearest step.
     *
     * @param {Event} e
     * @return {Coordinate}
     */
    _eventToSnapSteps(e) {
        let [x, y] = $(".workspace").makeRelative(e.pageX, e.pageY);
        let steps = this._grapher.getScale().toStepCoordinates({x, y});
        return new Coordinate(round(steps.x, 1), round(steps.y, 1));
    }
}

class ContextActions {
    /**
     * Add a point to the end of the path.
     *
     * @param {int} x
     * @param {int} y
     * @param {FollowLeaderContinuity} [continuity=this._continuity]
     */
    static addPoint(x, y, continuity=this._continuity) {
        continuity.path.push(new Coordinate(x, y));
        continuity.sheet.updateMovements(continuity.dotType);
        this._controller.refresh();

        return {
            data: [x, y, continuity],
            undo: function() {
                continuity.path.pop();
                continuity.sheet.updateMovements(continuity.dotType);
                this._controller.refresh();
            },
        };
    }

    /**
     * Move the coordinate at the given index to the given position.
     *
     * @param {int} index
     * @param {Coordinate} coordinate
     * @param {FollowLeaderContinuity} [continuity=this._continuity]
     */
    static movePoint(index, coordinate, continuity=this._continuity) {
        let oldCoord = continuity.path[index];
        continuity.path[index] = coordinate;
        continuity.sheet.updateMovements(continuity.dotType);
        this._controller.refresh();

        return {
            data: [index, coordinate, continuity],
            undo: function() {
                continuity.path[index] = oldCoord;
                continuity.sheet.updateMovements(continuity.dotType);
                this._controller.refresh();
            },
        };
    }

    /**
     * Remove the point at the given index from the path.
     *
     * @param {int} index
     * @param {FollowLeaderContinuity} [continuity=this._continuity]
     */
    static removePoint(index, continuity=this._continuity) {
        let coordinate = continuity.path.splice(index, 1)[0];
        continuity.sheet.updateMovements(continuity.dotType);
        this._controller.refresh();

        return {
            data: [index, continuity],
            undo: function() {
                continuity.path.splice(index, 0, coordinate);
                continuity.sheet.updateMovements(continuity.dotType);
                this._controller.refresh();
            },
        };
    }

    /**
     * Set the path to the given path.
     *
     * @param {Coordinate[]} path
     * @param {FollowLeaderContinuity} [continuity=this._continuity]
     */
    static setPath(path, continuity=this._continuity) {
        let oldPath = continuity.path;
        continuity.setPath(path);
        continuity.sheet.updateMovements(continuity.dotType);
        this._controller.refresh();

        return {
            data: [path, continuity],
            undo: function() {
                continuity.setPath(oldPath);
                continuity.sheet.updateMovements(continuity.dotType);
                this._controller.refresh();
            },
        };
    }
}
