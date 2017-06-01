import Coordinate from "calchart/Coordinate";
import HiddenGraphContext from "editor/contexts/HiddenContext";
import FollowLeaderPanel from "panels/FollowLeaderPanel";

import { round } from "utils/MathUtils";

/**
 * The Context that allows a user to define the path in
 * a follow the leader continuity.
 */
export default class FTLPathContext extends HiddenGraphContext {
    constructor(controller) {
        super(controller);

        // FollowLeaderContinuity
        this._continuity = null;

        // selection, add-point, remove-point
        this._activeTool = null;

        // {jQuery} helpers
        this._path = null;
        this._helper = null;
    }

    static get actions() {
        return ContextActions;
    }

    static get name() {
        return "ftl-path";
    }

    static get refreshTargets() {
        // reorder grapher first so that points exist for panel
        return ["grapher", "panel"];
    }

    get continuity() {
        return this._continuity;
    }

    get panel() {
        return FollowLeaderPanel;
    }

    get svg() {
        return this.grapher.getSVG();
    }

    /**
     * @param {Object} options - Options to customize loading the Context:
     *    - {FollowLeaderContinuity} continuity - The FTL continuity being edited
     */
    load(options) {
        super.load(options);

        this._continuity = options.continuity;

        this.loadTool("selection");

        let scale = this.grapher.getScale();
        this._addEvents(this.workspace, {
            mousedown: e => {
                if (this._activeTool === "selection" && $(e.target).is(".ref-point")) {
                    let point = $(e.target);
                    this.workspace.on({
                        "mousemove.ftl-path-move-point": e => {
                            let steps = this._eventToSnapSteps(e);
                            let coord = scale.toDistance(steps);
                            point.attr("cx", coord.x).attr("cy", coord.y);
                        },
                        "mouseup.ftl-path-move-point": e => {
                            let coordinate = this._eventToSnapSteps(e);
                            let index = point.data("index");
                            this.controller.doAction("movePoint", [index, coordinate]);
                            this.workspace.off(".ftl-path-move-point");
                        },
                    });
                }
            },
            click: e => {
                let coord = this._eventToSnapSteps(e);
                switch (this._activeTool) {
                    case "add-point":
                        this.controller.doAction("addPoint", [coord.x, coord.y]);
                        break;
                    case "remove-point":
                        let point = $(e.target);
                        if (point.is(".ref-point")) {
                            this.controller.doAction("removePoint", [point.data("index")]);
                        }
                        break;
                }
            },
        });
    }

    unload() {
        super.unload();

        // remove helpers
        this.svg.selectAll(".ref-point").remove();
        this._path.remove();
        if (this._helper) {
            this._helper.remove();
        }

        this._getGraphDots().css("opacity", "");

        this.checkContinuities({
            dots: this._continuity.dotType,
        });
    }

    refreshGrapher() {
        super.refreshGrapher();

        // highlight first dot in path
        let dot = this._continuity.getOrder()[0];
        let $dot = this.grapher.getDot(dot);
        this.selectDots($dot);
        this._getGraphDots().css("opacity", 1);

        let scale = this.grapher.getScale();
        let start = this.activeSheet.getDotInfo(dot).position;
        start = scale.toDistance(start);

        let pathDef = `M ${start.x} ${start.y}`;
        let prevPoint = start;
        let dotRadius = this.grapher.getDotRadius();

        // add reference points to SVG and build path
        this.svg.selectAll(".ref-point").remove();
        this._continuity.getPath().forEach((coordinate, i) => {
            let point = this.svg.append("circle")
                .attr("class", `ref-point point-${i}`)
                .attr("r", dotRadius);

            // reference points know their order
            $.fromD3(point).data("index", i);

            let scaled = scale.toDistance(coordinate);
            point.attr("cx", scaled.x).attr("cy", scaled.y);

            // diagonal path
            let deltaX = scaled.x - prevPoint.x;
            let deltaY = scaled.y - prevPoint.y;
            let delta = Math.min(Math.abs(deltaX), Math.abs(deltaY));
            deltaX = Math.sign(deltaX) * delta;
            deltaY = Math.sign(deltaY) * delta;
            pathDef += ` L ${prevPoint.x + deltaX} ${prevPoint.y + deltaY}`;

            // rest of path to next point
            pathDef += ` L ${scaled.x} ${scaled.y}`;
            prevPoint = scaled;
        });

        // initialize path
        this._path = this.svg.select("path.ftl-path-helper");
        if (this._path.empty()) {
            let path = this.svg.append("path").classed("ftl-path-helper", true);
            this._path = $.fromD3(path);
        }
        this._path.attr("d", pathDef);
    }

    /**
     * Load continuity context if the user is done with this context.
     */
    exit() {
        this.controller.loadContext("continuity", {
            dotType: this._continuity.dotType,
        });
    }

    /**** METHODS ****/

    /**
     * Load the given editing tool.
     *
     * @param {string} name
     */
    loadTool(name) {
        this._activeTool = name;

        this.workspace.off(".ftl-path-add-point");
        if (name === "add-point") {
            // add helper dot
            let scale = this.grapher.getScale();
            let dotRadius = this.grapher.getDotRadius();
            this.workspace.on("mousemove.ftl-path-add-point", e => {
                let steps = this._eventToSnapSteps(e);
                let coord = scale.toDistance(steps);

                if (_.isNull(this._helper)) {
                    this._helper = this.svg.append("circle")
                        .classed("ftl-path-add-point", true)
                        .attr("r", dotRadius);
                }
                this._helper.attr("cx", coord.x).attr("cy", coord.y);
            });
        } else if (this._helper) {
            this._helper.remove();
            this._helper = null;
        }

        $(".toolbar .ftl-path-context li").removeClass("active");
        $(`.toolbar .ftl-path-context .${name}`).addClass("active");
    }

    /**** HELPERS ****/

    /**
     * @param {jQuery}
     */
    _getGraphDots() {
        return this.grapher.getDots(this._continuity.getOrder());
    }
}

class ContextActions extends HiddenGraphContext.actions {
    /**
     * Add a point to the end of the path.
     *
     * @param {int} x
     * @param {int} y
     * @param {FollowLeaderContinuity} [continuity=this._continuity]
     */
    static addPoint(x, y, continuity=this._continuity) {
        let index = continuity.getPath().length;
        let coordinate = new Coordinate(x, y);
        continuity.addPoint(index, coordinate);
        continuity.sheet.updateMovements(continuity.dotType);
        this.refresh("grapher", "panel");

        return {
            data: [x, y, continuity],
            undo: function() {
                continuity.removePoint(index);
                continuity.sheet.updateMovements(continuity.dotType);
                this.refresh("grapher", "panel");
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
        let oldCoord = continuity.getPath()[index];
        continuity.setPoint(index, coordinate);
        continuity.sheet.updateMovements(continuity.dotType);
        this.refresh("grapher", "panel");

        return {
            data: [index, coordinate, continuity],
            undo: function() {
                continuity.setPoint(index, oldCoord);
                continuity.sheet.updateMovements(continuity.dotType);
                this.refresh("grapher", "panel");
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
        let coordinate = continuity.removePoint(index);
        continuity.sheet.updateMovements(continuity.dotType);
        this.refresh("grapher", "panel");

        return {
            data: [index, continuity],
            undo: function() {
                continuity.addPoint(index, coordinate);
                continuity.sheet.updateMovements(continuity.dotType);
                this.refresh("grapher", "panel");
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
        let oldPath = continuity.getPath();
        continuity.setPath(path);
        continuity.sheet.updateMovements(continuity.dotType);
        this.refresh("grapher", "panel");

        return {
            data: [path, continuity],
            undo: function() {
                continuity.setPath(oldPath);
                continuity.sheet.updateMovements(continuity.dotType);
                this.refresh("grapher", "panel");
            },
        };
    }
}
