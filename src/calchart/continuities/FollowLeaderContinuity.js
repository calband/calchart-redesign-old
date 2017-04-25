import BaseContinuity from "calchart/continuities/BaseContinuity";
import MovementCommandMove from "calchart/movements/MovementCommandMove";

import HTMLBuilder from "utils/HTMLBuilder";
import { setupTooltip } from "utils/UIUtils";

/**
 * A follow-the-leader continuity, where the sequence of dots is defined and
 * the path for the first dot is marked.
 */
export default class FollowLeaderContinuity extends BaseContinuity {
    /**
     * @param {Sheet} sheet
     * @param {DotType} dotType
     * @param {Dot[]} order - The order of Dots in the line
     * @param {Coordinate[]} path - The coordinates for the path of the first dot
     * @param {object} [options] - Options for the continuity, including:
     *   - {string} stepType
     *   - {int} beatsPerStep
     */
    constructor(sheet, dotType, order, path, options) {
        super(sheet, dotType, options);

        this._order = order;
        this._path = path;
    }

    static deserialize(sheet, dotType, data) {
        return new FollowLeaderContinuity(sheet, dotType, data.order, data.path, data);
    }

    serialize() {
        return super.serialize("FTL", {
            order: this._order,
            path: this._path,
        });
    }

    getMovements(dot, data) {
        // TODO: for each dot, add move to get to next dot, then add moves
        // of the next dot, minus number of beats it takes to get to the next dot

        // TODO: combine first two moves if in same direction
        return [];
    }

    panelHTML(controller) {
        let label = HTMLBuilder.span("FTL");

        let editLabel = HTMLBuilder.label("Edit:");

        let editDots = HTMLBuilder.icon("ellipsis-h").click(() => {
            console.log("edit dots");
            // TODO: popup with drag and drop dot order
            // TODO: show error if consecutive dots not in same vertical/horizontal line
        });
        setupTooltip(editDots, "Dots");

        let editPath = HTMLBuilder.icon("crosshairs").click(() => {
            console.log("edit path");
            // TODO: FTLPathContext
        });
        setupTooltip(editPath, "Path");

        return this._wrapPanel("ftl", [label, editLabel, editDots, editPath]);
    }

    popupHTML() {
        let { stepType, beatsPerStep, customText } = this._getPopupFields();

        return {
            name: "Follow the Leader",
            fields: [stepType, beatsPerStep, customText],
        };
    }
}