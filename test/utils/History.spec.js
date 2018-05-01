/**
 * @file Tests the History class.
 */

import History from 'utils/History';

describe('History', () => {
    it('initializes', () => {
        let state = { foo: 1 };
        let history = new History(state);
        expect(history.hasUndo).toBe(false);
        expect(history.hasRedo).toBe(false);
        expect(history.undoLabel).toBe('');
        expect(history.redoLabel).toBe('');
        expect(() => history.undo()).not.toThrow();
        expect(() => history.redo()).not.toThrow();
    });

    it('can undo and redo', () => {
        let state = { foo: 1 };
        let history = new History(state);
        expect(state.foo).toBe(1);

        // hasn't committed to history yet
        state.foo = 2;
        expect(history.hasUndo).toBe(false);

        let label = 'Increment foo';

        history.addState(label, state);
        expect(history.hasUndo).toBe(true);
        expect(history.hasRedo).toBe(false);
        expect(history.undoLabel).toBe(label);
        expect(history.redoLabel).toBe('');

        state = history.undo();
        expect(history.hasUndo).toBe(false);
        expect(history.hasRedo).toBe(true);
        expect(history.undoLabel).toBe('');
        expect(history.redoLabel).toBe(label);
        expect(state.foo).toBe(1);

        state = history.redo();
        expect(history.hasUndo).toBe(true);
        expect(history.hasRedo).toBe(false);
        expect(history.undoLabel).toBe(label);
        expect(history.redoLabel).toBe('');
        expect(state.foo).toBe(2);
    });

    it('clears redo after undo-do', () => {
        let state = { foo: 1 };
        let history = new History(state);

        state.foo = 2;
        history.addState('First', state);
        expect(history.undoLabel).toBe('First');
        expect(history.redoLabel).toBe('');

        state = history.undo();
        expect(state.foo).toBe(1);
        expect(history.undoLabel).toBe('');
        expect(history.redoLabel).toBe('First');

        state.foo = 3;
        history.addState('Second', state);
        expect(history.undoLabel).toBe('Second');
        expect(history.redoLabel).toBe('');

        state = history.undo();
        expect(state.foo).toBe(1);
        expect(history.undoLabel).toBe('');
        expect(history.redoLabel).toBe('Second');
    });
});
