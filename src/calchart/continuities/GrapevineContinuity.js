import ToEndContinuity from "calchart/continuities/ToEndContinuity";
import MovementCommandMove from "calchart/movements/MovementCommandMove";

/**
 * A grapevine continuity, which moves north or south to get to the next sheet's
 * position and marks time or closes for the rest of the beats.
 */
export default class GrapevineContinuity extends ToEndContinuity {
    static deserialize(sheet, dotType, data) {
        return new GrapevineContinuity(sheet, dotType, data);
    }

    get info() {
        return {
            type: "gv",
            name: "Grapevine",
            label: "GV",
        };
    }

    getMovements(dot, data) {
        let start = data.position;
        let end = this._getNextPosition(dot);
        if (_.isNull(end)) {
            return [];
        }

        let movements = [];
        let options = {
            orientation: this.getOrientationDegrees(),
            beatsPerStep: this.getBeatsPerStep(),
        };

        let deltaX = end.x - data.position.x;
        let duration = Math.abs(deltaX);

        if (duration > 0) {
            let move = new MovementCommandMove(
                start.x,
                start.y,
                deltaX < 0 ? 90 : 270,
                duration,
                options
            );
            movements.push(move);
        }

        data.remaining -= duration;
        start.x += deltaX;

        this._addEnd(movements, data.remaining, start, options);

        return movements;
    }
}
