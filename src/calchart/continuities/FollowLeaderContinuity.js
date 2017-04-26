import BaseContinuity from "calchart/continuities/BaseContinuity";
import DiagonalContinuity from "calchart/continuities/DiagonalContinuity";
import Coordinate from "calchart/Coordinate";
import Dot from "calchart/Dot";
import MovementCommandMove from "calchart/movements/MovementCommandMove";

import { MovementError } from "utils/errors";
import HTMLBuilder from "utils/HTMLBuilder";
import { setupTooltip, showPopup } from "utils/UIUtils";

/**
 * A follow-the-leader continuity, where the sequence of dots is defined and
 * the path for the first dot is marked. Dots will move to each point using a
 * DMHS continuity.
 */
export default class FollowLeaderContinuity extends BaseContinuity {
    /**
     * @param {Sheet} sheet
     * @param {DotType} dotType
     * @param {int[]} order - The order of dots (as IDs) in the line. order[0] is
     *   the first dot in the path.
     * @param {Coordinate[]} path - The coordinates for the path of the first dot.
     *   path[0] is the first coordinate to go to.
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

    get order() { return this._order; }
    get path() { return this._path; }

    serialize() {
        let path = this._path.map(coord => coord.serialize());

        return super.serialize("FTL", {
            order: this._order,
            path: path,
        });
    }

    getMovements(dot, data) {
        // validate that next dot is in same x/y position
        let index = this._order.indexOf(dot.id);
        if (index === -1) {
            this._order.push(dot.id);
            index = this._order.length - 1;
        }

        let path = _.clone(this._path);
        let show = this._sheet.getShow();
        for (var i = index - 1; i >= 0; i--) {
            let dot = show.getDot(this._order[i]);
            path.unshift(this._sheet.getDotInfo(dot).position);
        }

        let movements = [];
        for (var i = 0; i < path.length; i++) {
            // TODO: get movements to next position, using DiagonalContinuity.getDiagonalMoves()
            // TODO: combine moves if same direction
        }

        return movements;
    }

    panelHTML(controller) {
        let label = HTMLBuilder.span("FTL");

        let editLabel = HTMLBuilder.label("Edit:");

        let editDots = HTMLBuilder.icon("ellipsis-h").click(() => {
            controller.loadContext("ftl-dots", {
                continuity: this,
            });
        });
        setupTooltip(editDots, "Dots");

        let editPath = HTMLBuilder.icon("crosshairs").click(() => {
            controller.loadContext("ftl-path", {
                continuity: this,
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

    /**
     * @param {int[]} order - The new order of dots
     */
    setOrder(order) {
        this._order = order;
    }
}
