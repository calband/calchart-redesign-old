import BaseContinuity from "calchart/continuities/BaseContinuity";
import DiagonalContinuity from "calchart/continuities/DiagonalContinuity";
import Coordinate from "calchart/Coordinate";
import Dot from "calchart/Dot";
import MovementCommandMove from "calchart/movements/MovementCommandMove";

import { MovementError } from "utils/errors";
import HTMLBuilder from "utils/HTMLBuilder";
import { calcAngle } from "utils/MathUtils";
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
        let index = this._order.indexOf(dot.id);
        if (index === -1) {
            this._order.push(dot.id);
            index = this._order.length - 1;
        }

        // add preceding dot positions as reference points
        let path = this._path;
        let show = this._sheet.getShow();
        for (var i = 0; i <= index; i++) {
            let dot = show.getDot(this._order[i]);
            let position = this._sheet.getDotInfo(dot).position;
            path = [position].concat(path);
        }

        let prev = path[0];
        let lastMove = undefined;
        let movements = [];
        for (var i = 1; i < path.length; i++) {
            let next = path[i];
            // DMHS to next position
            let movesToNext = DiagonalContinuity.getDiagonalMoves(prev.x, prev.y, next.x, next.y, {
                diagFirst: true,
                beatsPerStep: this.getBeatsPerStep(),
            });
            movements = movements.concat(movesToNext);

            // combine moves if in same direction
            if (!_.isUndefined(lastMove)) {
                let dir1 = lastMove.getDirection();
                let dir2 = movesToNext[0].getDirection();
                if (dir1 === dir2) {
                    let start = lastMove.getStartPosition();
                    let duration = lastMove.getDuration() + movesToNext[0].getDuration();
                    let combined = new MovementCommandMove(start.x, start.y, dir1, duration, {
                        beatsPerStep: this.getBeatsPerStep(),
                    });
                    // remove lastMove and movesToNext[0] and add combined
                    movements.splice(movements.length - movesToNext.length - 1, 2, combined);
                }
            }

            prev = next;
            lastMove = _.last(movements);
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

    /**
     * @param {int[]} path - The new path of dots
     */
    setPath(path) {
        this._path = path;
    }
}
