/**
 * @file Tests the History class.
 */

import { createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';

import History from 'utils/History';

function newStore() {
    return new Vuex.Store({
        state: {
            foo: 1,
        },
        mutations: {
            setFoo(state, x) {
                state.foo = x;
            },
        },
    });
}

describe('History', () => {
    it('initializes', () => {
        let history = new History(newStore());
        expect(history.hasUndo).toBe(false);
        expect(history.hasRedo).toBe(false);
        expect(history.undoLabel).toBe('');
        expect(history.redoLabel).toBe('');
        expect(() => history.undo()).not.toThrow();
        expect(() => history.redo()).not.toThrow();
    });

    it('undoes', () => {
        let store = newStore();
        let history = new History(store);
        store.commit('setFoo', 2);

        // hasn't committed to history yet
        expect(store.state.foo).toBe(2);
        expect(history.hasUndo).toBe(false);

        history.addState('Increment foo', store.state);
        expect(history.hasUndo).toBe(true);
        expect(history.hasRedo).toBe(false);
        expect(history.undoLabel).toBe('Increment foo');
        expect(history.redoLabel).toBe('');

        // TODO: undo has redo
    });

    // TODO: test redo
    // TODO: test action after redo clears redo
});
