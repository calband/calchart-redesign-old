/**
 * @file Tests the Serializable class.
 */

import Serializable from 'utils/Serializable';

class Foo extends Serializable {}

describe('Serializable', () => {
    let foo = new Foo({
        x: 1,
        y: 2,
    });

    it('assigns values in the constructor', () => {
        expect(foo._x).toBe(1);
        expect(foo._y).toBe(2);
    });

    it('serializes', () => {
        expect(foo.serialize().x).toBe(1);
        expect(foo.serialize().y).toBe(2);
    });

    it('deserializes', () => {
        expect(Foo.deserialize({ x: 1, y: 2 })).toEqual(foo);
        expect(Foo.deserialize(foo.serialize())).toEqual(foo);
    });
});
