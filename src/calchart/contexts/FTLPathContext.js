import BaseContext from "calchart/contexts/BaseContext";
import Coordinate from "calchart/Coordinate";

import HTMLBuilder from "utils/HTMLBuilder";
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
                    this._movePoint(e);
                }
            },
            click: e => {
                let [x, y] = $(".workspace").makeRelative(e.pageX, e.pageY);
                let steps = scale.toStepCoordinates({x, y});
                // round to nearest step
                x = Math.round(steps.x);
                y = Math.round(steps.y);
                switch (this._activeTool) {
                    case "add-point":
                        this._controller.doAction("addPoint", [x, y]);
                        break;
                    case "remove-point":
                        // TODO: doAction(removePoint)
                        break;
                }
            },
        })
    }

    unload() {
        super.unload();

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
        if (name === "add-point") {
            // add helper dot
            let scale = this._grapher.getScale();
            let dotRadius = scale.toDistance(3/4);
            $(".workspace").on("mousemove.ftl-path-add-point", e => {
                let [x, y] = $(".workspace").makeRelative(e.pageX, e.pageY);
                let steps = scale.toStepCoordinates({x, y});
                let coord = scale.toDistanceCoordinates({
                    x: Math.round(steps.x),
                    y: Math.round(steps.y),
                });

                let helper = this._svg.select(".ftl-path-add-point");
                if (helper.empty()) {
                    helper = this._svg.append("circle")
                        .classed("ftl-path-add-point", true)
                        .attr("r", dotRadius);
                }
                helper.attr("cx", coord.x).attr("cy", coord.y);
            });
        }

        $(".toolbar .ftl-path-group li").removeClass("active");
        $(`.toolbar .ftl-path-group .${name}`).addClass("active");
    }

    /**
     * Handle the mousedown event using the selection tool.
     *
     * @param {Event} e
     */
    _movePoint(e) {
        // TODO: mousemove: move point on graph
        // TODO: mouseup: doAction("movePoint")
    }

    _setupPanel() {
        setupPanel(this._panel);

        this._panel.find("button.submit").click(() => {
            this.unload();
        });
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

    // TODO: remove coordinate
    // TODO: move coordinate
    // TODO: reorder coordinates
}
