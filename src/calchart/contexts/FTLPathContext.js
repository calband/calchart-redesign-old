import BaseContext from "calchart/contexts/BaseContext";

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

        this._addEvents(".workspace", "mousedown", e => {
            switch (this._activeTool) {
                case "selection":
                    break;
                case "add-point":
                    break;
                case "remove-point":
                    break;
            }
        });
    }

    unload() {
        super.unload();

        this._path.remove();
        this._panel.hide();
        $(".toolbar .ftl-path-group").addClass("hide");

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

        this._list.empty();
        let scale = this._grapher.getScale();
        let dotRadius = scale.toDistance(3/4);

        let start = this._sheet.getDotInfo(dot.data("dot")).position;
        let startScaled = scale.toDistanceCoordinates(start);
        let pathDef = `M ${startScaled.x} ${startScaled.y}`;
        let prevPoint = startScaled;

        // populate panel and add reference points to SVG
        this._continuity.path.forEach((coordinate, i) => {
            let point = this._svg.select(`.ref-point.point-${i}`);
            if (point.empty()) {
                point = this._svg.append("circle")
                    .classed(`ref-point point-${i}`, true)
                    .attr("r", dotRadius);
            }

            let scaled = scale.toDistanceCoordinates(coordinate);
            point.attr("x", scaled.x).attr("y", scaled.y);
            if (prevPoint.x !== scaled.x && prevPoint.y !== scaled.y) {
                let delta = Math.min(scaled.x - prevPoint.x, scaled.y - prevPoint.y);
                pathDef += ` L ${prevPoint.x + delta} ${prevPoint.y + delta}`;
            }
            pathDef += ` L ${scaled.x} ${scaled.y}`;
            prevPoint = scaled;

            let label = `(${coordinate.x}, ${coordinate.y})`;
            let li = HTMLBuilder.li(label, "point")
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
                // let order = this._list.children().map(function() {
                //     return $(this).data("id");
                // }).get();
                // controller.doAction("changeDotOrder", [order]);
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

        $(".toolbar .ftl-path-group li").removeClass("active");
        $(`.toolbar .ftl-path-group .${name}`).addClass("active");
    }

    _setupPanel() {
        setupPanel(this._panel);

        this._panel.find("button.submit").click(() => {
            this.unload();
        });
    }
}

class ContextActions {
    // TODO: add coordinate
    // TODO: remove coordinate
    // TODO: move coordinate
    // TODO: reorder coordinates
}
