/**
 * @file Defines the class that tracks undo/redo history in the editor.
 */

import _ from 'lodash';

class BaseHistory {
    /**
     * Initialize the history in a store.
     *
     * @param {Store} store
     */
    init(store) {
        this._store = store;
        this._history = [];
        this._index = -1;

        this.addState(store.rootState);
    }

    /**
     * @return {Boolean} true if the history has an undo state.
     */
    get hasUndo() {
        return this._index > 0;
    }

    /**
     * @return {Boolean} true if the history has a redo state.
     */
    get hasRedo() {
        return this._index + 1 < this._history.length;
    }

    /**
     * @return {String} the label of the latest action.
     */
    get undoLabel() {
        if (this.hasUndo) {
            return this._history[this._index - 1].label;
        } else {
            return '';
        }
    }

    /**
     * @return {String} the label of the most recent undone action.
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
     * @param {String} name - The name of the action
     * @param {Object} state
     */
    addState(action, state) {
        if (this.hasRedo) {
            this._history.splice(this._index + 1);
        }
        this._history.push({
            label: _.capitalize(_.lowerCase(action)),
            state: _.cloneDeep(state)
        });
        this._index++;
    }

    /**
     * Get a state from history to replace the current state.
     *
     * @param {int} index
     */
    getState(index) {
        let state = this._history[index];
        state.state = _.cloneDeep(state.state);
        return state;
    }

    /**
     * Undo the latest action.
     */
    undo() {
        if (this.hasUndo) {
            let prevState = this.getState(this._index - 1);
            this._store.replaceState(prevState.state);
            this._index--;
        }
    }

    /**
     * Redo the latest undone action.
     */
    redo() {
        if (this.hasRedo) {
            let nextState = this.getState(this._index + 1);
            this._store.replaceState(nextState.state);
            this._index++;
        }
    }
}

export default new BaseHistory();
