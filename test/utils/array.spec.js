/**
 * @file Tests array utility functions.
 */

import { findAndRemove, unique } from 'utils/array';

describe('findAndRemove', () => {
    it('removes objects matching a property', () => {
        let vals = [
            { x: 1 },
            { x: 2 },
            { x: 3 },
        ];
        findAndRemove(vals, ['x', 1]);
        expect(vals).toHaveLength(2);
        expect(vals).not.toContainEqual({ x: 1 });
    });
});

describe('unique', () => {
    it('works for primitives', () => {
        let list = unique([1, 2, 1, 2, 3, 2, 'a', 'b', 'a']);
        expect(list).toEqual([1, 2, 3, 'a', 'b']);
    });
});
