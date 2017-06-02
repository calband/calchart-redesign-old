import OrderedDotsContinuity from "calchart/continuities/OrderedDotsContinuity";
import Continuity from "calchart/Continuity";
import MovementCommandStop from "calchart/movements/MovementCommandStop";
import { TwoStepContinuityPopup } from "popups/ContinuityPopups";

import HTMLBuilder from "utils/HTMLBuilder";
import { moveElem } from "utils/JSUtils";
import { setupTooltip } from "utils/UIUtils";

/**
 * A two step continuity, where each dot in a line does a given set of
 * continuities 2 beats after the previous dot.
 */
export default class TwoStepContinuity extends OrderedDotsContinuity {
    /**
     * @param {Sheet} sheet
     * @param {DotType} dotType
     * @param {Dot[]} order
     * @param {Continuity[]} continuities - The continuities each dot should execute
     *   after waiting the appropriate amount of time.
     * @param {object} [options] - Options for the continuity, including:
     *   - {string} stepType
     *   - {int} beatsPerStep
     *   - {string} orientation - The direction to face in the beginning.
     *   - {boolean} [isMarktime=true] - true if mark time during step two, false for close
     */
    constructor(sheet, dotType, order, continuities, options) {
        super(sheet, dotType, order, options);

        options = _.defaults({}, options, {
            isMarktime: true,
        });

        this._continuities = continuities;
        this._isMarktime = options.isMarktime;
    }

    static deserialize(sheet, dotType, data) {
        let order = this.deserializeOrder(sheet, data);
        let continuities = data.continuities.map(
            continuity => Continuity.deserialize(sheet, dotType, continuity)
        );
        return new TwoStepContinuity(sheet, dotType, order, continuities, data);
    }

    serialize() {
        let continuities = this._continuities.map(continuity => continuity.serialize());
        return super.serialize({
            continuities: continuities,
            isMarktime: this._isMarktime,
        });
    }

    static get popupClass() {
        return TwoStepContinuityPopup;
    }

    get info() {
        return {
            type: "two",
            name: "Two Step",
            label: "2-Step",
        };
    }

    /**** METHODS ****/

    clone(key, val) {
        switch (key) {
            case "_continuities":
                return val.map(continuity =>
                    _.cloneDeepWith(continuity, (val, key) => continuity.clone(key, val))
                );
        }
        return super.clone(key, val);
    }

    /**
     * Add the given continuity to the step-two drill.
     *
     * @param {Continuity} continuity
     */
    addContinuity(continuity) {
        this._continuities.push(continuity);
        this.sheet.updateMovements(this.dotType);
    }

    /**
     * @return {Continuity[]}
     */
    getContinuities() {
        return this._continuities;
    }

    /**
     * @return {boolean}
     */
    getIsMarktime() {
        return this._isMarktime;
    }

    getMovements(dot, data) {
        // number of steps to wait
        let options = {
            beatsPerStep: this.getBeatsPerStep(),
        };
        let wait = this.getOrderIndex(dot) * 2;

        let stop = new MovementCommandStop(
            data.position.x,
            data.position.y,
            this.getOrientationDegrees(),
            wait,
            this._isMarktime,
            options
        );

        let movements = this.constructor.buildMovements(
            this._continuities, dot, data.position, data.remaining - wait
        );

        return [stop].concat(movements);
    }

    /**
     * Move the continuity at the given index in the step-two drill
     * to the specified index.
     *
     * @param {int} from
     * @param {int} to
     */
    moveContinuity(from, to) {
        moveElem(this._continuities, from, to);
        this.sheet.updateMovements(this.dotType);
    }

    getPanel(context) {
        let panel = super.getPanel(context);

        let editContinuities = HTMLBuilder.icon("map-signs").click(e => {
            context.controller.loadContext("two-step", {
                continuity: this,
            });
        });
        setupTooltip(editContinuities, "Continuities");

        return _.concat(panel, editContinuities);
    }

    /**
     * Remove the given continuity from the step-two drill.
     *
     * @param {Continuity} continuity
     */
    removeContinuity(continuity) {
        _.pull(this._continuities, continuity);
        this.sheet.updateMovements(this.dotType);
    }
}
