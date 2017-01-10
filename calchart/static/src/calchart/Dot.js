import AnimationState from "./AnimationState";

/**
 * A Dot represents a marcher in a Show, containing the following information:
 *  - the dot label
 */
export default class Dot {
    /**
     * @param {string} label
     */
    constructor(label) {
        this._label = label;
    }

    /**
     * Create a Dot from the given serialized data
     *
     * @param {Object} data - The JSON data to initialize the Dot with.
     * @return {Dot}
     */
    static deserialize(data) {
        return new Dot(data.label);
    }

    /**
     * Return the JSONified version of the Dot
     *
     * @return {Object}
     */
    serialize() {
        return {
            label: this._label,
        };
    }

    /**
     * Compare this Dot with the given Dot, according to their labels.
     *
     * @param {Dot} other
     * @return {int} -1 if this dot's label is sorted before the other's dot,
     *   1 if this dot's label is sorted after, or 0 if the labels are the same.
     */
    compareTo(other) {
        let label1 = this._label;
        let label2 = other.getLabel();

        // try to parse out numbers from labels
        let num1 = parseInt(label1);
        let num2 = parseInt(label2);
        if (num1 && num2) {
            label1 = num1;
            label2 = num2;
        }

        return label1 < label2 ? -1 : label1 > label2 ? 1 : 0;
    }

    /**
     * @return {string} the Dot's label
     */
    getLabel() {
        return this._label;
    }
}
