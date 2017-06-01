/**
 * A helper class that turns an array into an iterator.
 */
export default class Iterator {
    /**
     * @param {Object[]} source - The array to iterate over. Any modifications
     *   to this array will not affect the iterator.
     * @param {Object} [options] - Options to customize iteration:
     *   - {boolean} [cycle=false] - Set to true to go back to the first
     *     element in the array upon completion.
     */
    constructor(source, options={}) {
        this._source = _.clone(source);

        options = _.defaults({}, options, {
            cycle: false,
        });
        this._cycle = options.cycle;

        this._index = -1;
    }

    /**
     * @return {Object} The element currently loaded.
     */
    get() {
        let index = this._index % this._source.length;
        return this._source[index];
    }

    /**
     * @return {boolean} true if the iterator has cycled at least once.
     */
    hasCycled() {
        return this._index >= this._source.length;
    }

    /**
     * @return {boolean} true if the iterator has another element that can be loaded.
     */
    hasNext() {
        return this._cycle || this._index < this._source.length - 1;
    }

    /** 
     * Load the next element in the iterator.
     */
    next() {
        this._index++;
    }
}
