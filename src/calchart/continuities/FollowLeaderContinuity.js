import BaseContinuity from "calchart/continuities/BaseContinuity";
import Coordinate from "calchart/Coordinate";
import Dot from "calchart/Dot";
import MovementCommandMove from "calchart/movements/MovementCommandMove";

import HTMLBuilder from "utils/HTMLBuilder";
import { setupTooltip, showPopup } from "utils/UIUtils";

/**
 * A follow-the-leader continuity, where the sequence of dots is defined and
 * the path for the first dot is marked.
 */
export default class FollowLeaderContinuity extends BaseContinuity {
    /**
     * @param {Sheet} sheet
     * @param {DotType} dotType
     * @param {int[]} order - The order of dots (as IDs) in the line
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
        let path = data.path.map(coordData => Coordinate.deserialize(coordData));

        return new FollowLeaderContinuity(sheet, dotType, data.order, path, data);
    }

    serialize() {
        let path = this._path.map(coord => coord.serialize());

        return super.serialize("FTL", {
            order: this._order,
            path: path,
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
            controller.loadContext("ftl-dots", {
                dotType: this._dotType,
                order: this._order,
            });
        });
        setupTooltip(editDots, "Dots");

        let editPath = HTMLBuilder.icon("crosshairs").click(() => {
            controller.loadContext("ftl-path", {
                dotType: this._dotType,
                order: this._order,
                path: this._path,
            });
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
