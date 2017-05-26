import BaseContinuity from "calchart/continuities/BaseContinuity";

/**
 * A superclass for all continuities that require dots to be in order.
 */
export default class OrderedDotsContinuity extends BaseContinuity {
    /**
     * @param {Sheet} sheet
     * @param {DotType} dotType
     * @param {Dot[]} order - The order of dots in the line. order[0] is the
     *   first dot in the path.
     * @param {object} [options]
     */
    constructor(sheet, dotType, order, options) {
        super(sheet, dotType, options);

        this._order = order;
    }

    /**** METHODS ****/

    clone(key, val) {
        switch (key) {
            case "_order":
                return val;
        }
        return super.clone(key, val);
    }

    /**
     * @return {Dot[]}
     */
    getOrder() {
        return this._order;
    }

    /**
     * Reverse the order of the dots.
     */
    reverseOrder() {
        this._order.reverse();
    }

    /**
     * @param {Dot[]} order - The new order of dots
     */
    setOrder(order) {
        this._order = order;
    }
}
