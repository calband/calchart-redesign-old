import BaseContinuity from "calchart/continuities/BaseContinuity";
import DiagonalContinuity from "calchart/continuities/DiagonalContinuity";
import Coordinate from "calchart/Coordinate";
import Dot from "calchart/Dot";
import MovementCommandMove from "calchart/movements/MovementCommandMove";

import { MovementError } from "utils/errors";
import HTMLBuilder from "utils/HTMLBuilder";
import Iterator from "utils/Iterator";
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

    serialize() {
        let path = this._path.map(coord => coord.serialize());

        return super.serialize("FTL", {
            order: this._order,
            path: path,
        });
    }

    get name() {
        return "ftl";
    }

    get order() { return this._order; }
    get path() { return this._path; }

    getMovements(dot, data) {
        let index = this._order.indexOf(dot.id);
        if (index === -1) {
            this._order.push(dot.id);
            index = this._order.length - 1;
        }

        let path = this._getPath(index);

        path.next();
        let prev = path.get();
        let lastMove = undefined;
        let movements = [];
        let beats = 0;
        let maxDuration = this._getMaxDuration(data);

        while (beats < maxDuration && path.hasNext()) {
            path.next();
            let next = path.get();

            // DMHS to next position
            let movesToNext = DiagonalContinuity.getDiagonalMoves(prev.x, prev.y, next.x, next.y, {
                diagFirst: true,
                beatsPerStep: this.getBeatsPerStep(),
            });

            // update beats
            for (let i = 0; i < movesToNext.length; i++) {
                let move = movesToNext[0];
                let duration = move.getDuration();
                beats += duration;
                if (beats >= maxDuration) {
                    // truncate movement duration
                    move.setDuration(duration + maxDuration - beats);
                    // drop all further movements
                    movesToNext = _.take(movesToNext, i + 1);
                }
            }

            movements = movements.concat(movesToNext);
            let currMove = movesToNext[0];

            // combine moves if in same direction
            if (!_.isUndefined(lastMove)) {
                let dir1 = lastMove.getDirection();
                let dir2 = currMove.getDirection();
                if (dir1 === dir2) {
                    let duration = lastMove.getDuration() + currMove.getDuration();
                    lastMove.setDuration(duration);
                    // remove currMove from movements
                    _.pull(movements, currMove);
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

        return this._wrapPanel(label, editLabel, editDots, editPath);
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

    /**
     * Get the path for the dot at the given index to follow. The first
     * element in the path should be the dot's initial position.
     *
     * @param {int} index - The index of the current dot in the order.
     * @return {Iterator<Coordinate>}
     */
    _getPath(index) {
        let path = this._path;
        let show = this._sheet.getShow();

        // add preceding dot positions as reference points
        for (let i = 0; i <= index; i++) {
            let dot = show.getDot(this._order[i]);
            let position = this._sheet.getDotInfo(dot).position;
            path = [position].concat(path);
        }

        return new Iterator(path);
    }

    /**
     * Get the maximum number of beats this continuity's movements should
     * take.
     *
     * @param {Object} data - See getMovements
     * @return {int}
     */
    _getMaxDuration(data) {
        return data.remaining;
    }
}
