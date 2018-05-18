/**
 * @file Tests the History class.
 */

import History from 'utils/History';
import { BaseSerializable } from 'utils/Serializable';

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

    it('clones old states', () => {
        let state = { foo: { bar: 1 } };
        let history = new History(state);

        state.foo.bar = 2;
        history.addState('change', state);

        state = history.undo();
        expect(state.foo.bar).toBe(1);

        state = history.redo();
        expect(state.foo.bar).toBe(2);
    });

    it('clones states with Serializable objects', () => {
        class Foo extends BaseSerializable {
            constructor(data) {
                super(data, {
                    bar: Bar,
                });
            }
        }

        class Bar extends BaseSerializable {
            constructor(data) {
                super(data, {
                    x: 'number',
                });
            }
        }

        let bar = new Bar({ x: 1 });
        let foo = new Foo({ bar });
        let state = { foo };
        let history = new History(state);

        state.foo.bar._x = 2;
        history.addState('change', state);

        state = history.undo();
        expect(state.foo.bar.x).toBe(1);

        state = history.redo();
        expect(state.foo.bar.x).toBe(2);
    });
});
