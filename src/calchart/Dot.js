import AnimationState from "calchart/AnimationState";

/**
 * A Dot represents a marcher in a Show, containing the following information:
 *  - the dot ID
 *  - the dot label
 */
export default class Dot {
    /**
     * @param {number} id
     * @param {string} label
     */
    constructor(id, label) {
        this._id = id;
        this._label = label;
    }

    /**
     * Create a Dot from the given serialized data.
     *
     * @param {Object} data - The JSON data to initialize the Dot with.
     * @return {Dot}
     */
    static deserialize(data) {
        return new Dot(data.id, data.label);
    }

    get id() {
        return this._id;
    }

    get label() {
        return this._label;
    }

    /**
     * Return the JSONified version of the Dot.
     *
     * @return {Object}
     */
    serialize() {
        return {
            id: this._id,
            label: this._label,
        };
    }
}
