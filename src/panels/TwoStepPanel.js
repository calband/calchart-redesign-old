import ContinuityPanel from "panels/ContinuityPanel";

import HTMLBuilder from "utils/HTMLBuilder";

export default class TwoStepPanel extends ContinuityPanel {
    get name() {
        return "two-step";
    }

    // nothing in footer to refresh
    refreshFooter() {}

    /**** METHODS ****/

    getContinuities() {
        return this._context.continuity.getContinuities();
    }

    getDotType() {
        return this._context.continuity.dotType;
    }

    getFooter() {
        let button = HTMLBuilder.make("button")
            .append(HTMLBuilder.icon("check"))
            .click(e => this._context.exit());

        return HTMLBuilder.div("buttons", [button]);
    }
}
