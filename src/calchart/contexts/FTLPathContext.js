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

        // TODO: add to toolbar, add coordinate, remove coordinate, move coordinate (default)
        // TODO: add panel to order coordinates

        this._addEvents(".workspace", "mousedown", e => {
            // TODO
        });
    }

    unload() {
        super.unload();

        this._path.remove();

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
}

class ContextActions {
    // TODO: add coordinate
    // TODO: remove coordinate
    // TODO: move coordinate
    // TODO: reorder coordinates
}
