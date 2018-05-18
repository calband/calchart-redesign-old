/**
 * @file Defines the class that tracks undo/redo history in a store.
 *
 * When state is stored in history, it will be a deep clone, meaning that
 * anything in the state that is meant to be a reference should instead be an
 * ID.
 */

import { capitalize, cloneDeepWith, lowerCase } from 'lodash';

import { cloneSerializable } from 'utils/Serializable';

/**
 * Clone the given state, handling cloning Serializable objects.
 *
 * @param {Object} state
 * @return {Object}
 */
function cloneState(state) {
    return cloneDeepWith(state, cloneSerializable);
}

export default class History {
    /**
     * @param {Object} initialState
     */
    constructor(initialState) {
        this._history = [];
        this._index = -1;

        this.addState('', initialState);
    }

    /**
     * @return {boolean} true if the history has an undo state.
     */
    get hasUndo() {
        return this._index > 0;
    }

    /**
     * @return {boolean} true if the history has a redo state.
     */
    get hasRedo() {
        return this._index + 1 < this._history.length;
    }

    /**
     * @return {string} the label of the latest action.
     */
    get undoLabel() {
        if (this.hasUndo) {
            return this._history[this._index].label;
        } else {
            return '';
        }
    }

    /**
     * @return {string} the label of the most recently undone action.
     */
    get redoLabel() {
        if (this.hasRedo) {
            return this._history[this._index + 1].label;
        } else {
            return '';
        }
    }

    /**
     * Add a state to the history.
     *
     * @param {string} label
     * @param {Object} state
     */
    addState(label, state) {
        if (this.hasRedo) {
            this._history.splice(this._index + 1);
        }
        this._history.push({
            label: capitalize(lowerCase(label)),
            state: cloneState(state),
        });
        this._index++;
    }

    /**
     * Undo the latest action.
     *
     * @return {object}
     */
    undo() {
        if (this.hasUndo) {
            this._index--;
            return this._getState(this._index);
        }
    }

    /**
     * Redo the latest undone action.
     *
     * @return {object}
     */
    redo() {
        if (this.hasRedo) {
            this._index++;
            return this._getState(this._index);
        }
    }

    /**
     * Get a state from history to replace the current state.
     *
     * @param {number} index
     * @return {Object}
     */
    _getState(index) {
        return cloneState(this._history[index].state);
    }
}
