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

    /**
     * Deserialize the order in the given data.
     *
     * @param {Sheet} sheet
     * @param {object} data
     * @return {Dot[]}
     */
    static deserializeOrder(sheet, data) {
        return data.order.map(id => sheet.show.getDot(id));
    }

    serialize(data={}) {
        data.order = this._order.map(dot => dot.id);
        return super.serialize(data);
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
     * Get the index of the given dot in the order. If the dot is
     * not in the order, add it to the end of the order, in the
     * case that the dot was added to the dot type after the continuity
     * was created.
     *
     * @param {Dot} dot
     * @return {int} index
     */
    getOrderIndex(dot) {
        let index = this._order.indexOf(dot);
        if (index === -1) {
            this._order.push(dot);
            index = this._order.length - 1;
        }
        return index;
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
