import BaseContext from "calchart/contexts/BaseContext";

/**
 * The Context that allows a user to define the path in
 * a follow the leader continuity.
 */
export default class FTLPathContext extends BaseContext {
    constructor(controller) {
        super(controller);

        // FollowLeaderContinuity
        this._continuity = null;

        // selection, add-point, remove-point
        this._activeTool = null;
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
        // TODO: add panel to order coordinates

        $(".toolbar .ftl-path-group").removeClass("hide");

        this._addEvents(".workspace", "mousedown", e => {
            // TODO
        });
    }

    unload() {
        super.unload();

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

        let svg = this._grapher.getSVG();
        let path = svg.select(".ftl-path-helper");
        if (path.empty()) {
            path = svg.append("path").classed("ftl-path-helper", true);
        }
        path = $.fromD3(path);

        // TODO: draw path
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
}

class ContextActions {
    // TODO: add coordinate
    // TODO: remove coordinate
    // TODO: move coordinate
    // TODO: reorder coordinates
}
