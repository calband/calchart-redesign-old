/**
 * @file Defines the class that tracks undo/redo history in a store.
 */

import { capitalize, cloneDeep, lowerCase } from 'lodash';

export default class History {
    /**
     * @param {Store} store
     */
    constructor(store) {
        this._store = store;
        this._history = [];
        this._index = -1;

        this.addState('', store.rootState);
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
            state: cloneDeep(state),
        });
        this._index++;
    }

    /**
     * Undo the latest action.
     */
    undo() {
        if (this.hasUndo) {
            let prevState = this._getState(this._index - 1);
            this._store.replaceState(prevState.state);
            this._index--;
        }
    }

    /**
     * Redo the latest undone action.
     */
    redo() {
        if (this.hasRedo) {
            let nextState = this._getState(this._index + 1);
            this._store.replaceState(nextState.state);
            this._index++;
        }
    }

    /**
     * Get a state from history to replace the current state.
     *
     * @param {number} index
     */
    _getState(index) {
        let state = this._history[index];
        state.state = cloneDeep(state.state);
        return state;
    }
}
