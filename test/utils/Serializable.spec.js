/**
 * @file Tests the Serializable class.
 */

import { BaseSerializable } from 'utils/Serializable';

class TestSerializable extends BaseSerializable {
    static getClass(name) {
        switch (name) {
            case 'Foo': return Foo;
            case 'Bar': return Bar;
        }
    }
}

class Foo extends TestSerializable {
    constructor(data) {
        super(data, {
            x: 'number',
            y: 'number',
            bar: [null, Bar],
        });
    }
}

class Bar extends TestSerializable {
    constructor(data) {
        super(data, {
            a: 'number',
            b: 'number',
        });
    }
}

let foo = new Foo({
    x: 1,
    y: 2,
    bar: null,
});

let bar1 = new Bar({
    a: 3,
    b: 4,
});

let foo1 = new Foo({
    x: 5,
    y: 6,
    bar: bar1,
});

describe('BaseSerializable', () => {
    describe('typechecking', () => {
        it('works for valid data', () => {
            expect(() => new Foo({ x: 1, y: 2, bar: null })).not.toThrow();
        });

        it('throws for wrong typeof', () => {
            expect(() => new Foo({ x: '1', y: 2, bar: null })).toThrow();
        });

        it('throws for missing key', () => {
            expect(() => new Foo({ x: 1, y: 2 })).toThrow();
        });
    });

    it('assigns values in the constructor', () => {
        expect(foo._x).toBe(1);
        expect(foo._y).toBe(2);
        expect(foo._bar).toBeNull();
    });

    it('adds getters to instance', () => {
        expect(foo.x).toBe(1);
        expect(foo.y).toBe(2);
        expect(foo.bar).toBeNull();
        expect(() => { foo.x = 2; }).toThrow();
    });

    it('serializes', () => {
        expect(foo.serialize().x).toBe(1);
        expect(foo.serialize().y).toBe(2);
        expect(foo.serialize().bar).toBe(null);
    });

    it('deserializes', () => {
        expect(Foo.deserialize({ x: 1, y: 2, bar: null })).toEqual(foo);
        expect(Foo.deserialize(foo.serialize())).toEqual(foo);
    });

    it('serializes recursively', () => {
        expect(foo1.serialize().bar.a).toBe(3);
        expect(foo1.serialize().bar.b).toBe(4);
    });

    it('deserializes recursively', () => {
        let newFoo = Foo.deserialize(foo1.serialize());
        expect(newFoo).toEqual(foo1);
        expect(newFoo._bar).toEqual(bar1);
    });

    it('clones', () => {
        let clone = foo.cloneDeep();
        expect(clone).not.toBe(foo);
        expect(clone).toEqual(foo);
        expect(clone.x).toBe(foo.x);
    });
});
