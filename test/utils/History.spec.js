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
        let store = newStore();
        let history = new History(store, store.state);
        expect(history.hasUndo).toBe(false);
        expect(history.hasRedo).toBe(false);
        expect(history.undoLabel).toBe('');
        expect(history.redoLabel).toBe('');
        expect(() => history.undo()).not.toThrow();
        expect(() => history.redo()).not.toThrow();
    });

    it('can undo and redo', () => {
        let store = newStore();
        let history = new History(store, store.state);
        expect(store.state.foo).toBe(1);
        store.commit('setFoo', 2);

        // hasn't committed to history yet
        expect(store.state.foo).toBe(2);
        expect(history.hasUndo).toBe(false);

        let label = 'Increment foo';

        history.addState(label, store.state);
        expect(history.hasUndo).toBe(true);
        expect(history.hasRedo).toBe(false);
        expect(history.undoLabel).toBe(label);
        expect(history.redoLabel).toBe('');

        history.undo();
        expect(history.hasUndo).toBe(false);
        expect(history.hasRedo).toBe(true);
        expect(history.undoLabel).toBe('');
        expect(history.redoLabel).toBe(label);
        expect(store.state.foo).toBe(1);

        history.redo();
        expect(history.hasUndo).toBe(true);
        expect(history.hasRedo).toBe(false);
        expect(history.undoLabel).toBe(label);
        expect(history.redoLabel).toBe('');
        expect(store.state.foo).toBe(2);
    });

    it('clears redo after undo-do', () => {
        let store = newStore();
        let history = new History(store, store.state);

        store.commit('setFoo', 2);
        history.addState('First', store.state);
        expect(store.state.foo).toBe(2);
        expect(history.undoLabel).toBe('First');
        expect(history.redoLabel).toBe('');

        history.undo();
        expect(store.state.foo).toBe(1);
        expect(history.undoLabel).toBe('');
        expect(history.redoLabel).toBe('First');

        store.commit('setFoo', 3);
        history.addState('Second', store.state);
        expect(store.state.foo).toBe(3);
        expect(history.undoLabel).toBe('Second');
        expect(history.redoLabel).toBe('');

        history.undo();
        // TODO: fix
        expect(store.state.foo).toBe(1);
        expect(history.undoLabel).toBe('');
        expect(history.redoLabel).toBe('Second');
    });
});
