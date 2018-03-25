/**
 * @file Tests utility functions for types.
 */

import { checkType, isSubClass } from 'utils/types';

describe('isSubClass', () => {
    class Foo {}
    class Bar extends Foo {}
    class Baz {}

    it('checks same class', () => {
        expect(isSubClass(Foo, Foo)).toBe(true);
    });

    it('checks subclass', () => {
        expect(isSubClass(Bar, Foo)).toBe(true);
    });

    it('fails superclass', () => {
        expect(isSubClass(Foo, Bar)).toBe(false);
    });

    it('fails non-subclass', () => {
        expect(isSubClass(Foo, Baz)).toBe(false);
        expect(isSubClass(Bar, Baz)).toBe(false);
    });
});

describe('checkType', () => {
    class Foo {}
    class Bar extends Foo {}
    class Baz {}

    it('checks null', () => {
        expect(checkType(null, null)).toBe(true);
        expect(checkType(1, null)).toBe(false);
        expect(checkType('1', null)).toBe(false);
        expect(checkType(true, null)).toBe(false);
        expect(checkType(new Foo(), null)).toBe(false);
    });

    it('checks primitives', () => {
        expect(checkType(1, 'number')).toBe(true);
        expect(checkType('1', 'number')).toBe(false);
        expect(checkType(true, 'number')).toBe(false);
        expect(checkType(new Foo(), 'number')).toBe(false);

        expect(checkType(1, 'string')).toBe(false);
        expect(checkType('1', 'string')).toBe(true);
        expect(checkType(true, 'string')).toBe(false);
        expect(checkType(new Foo(), 'string')).toBe(false);

        expect(checkType(1, 'boolean')).toBe(false);
        expect(checkType('1', 'boolean')).toBe(false);
        expect(checkType(true, 'boolean')).toBe(true);
        expect(checkType(new Foo(), 'boolean')).toBe(false);
    });

    it('checks types', () => {
        expect(checkType(new Foo(), Foo)).toBe(true);
        expect(checkType(new Bar(), Foo)).toBe(true);
        expect(checkType(new Baz(), Foo)).toBe(false);

        expect(checkType(new Foo(), Bar)).toBe(false);
        expect(checkType(new Bar(), Bar)).toBe(true);
        expect(checkType(new Baz(), Bar)).toBe(false);

        expect(checkType(new Foo(), Baz)).toBe(false);
        expect(checkType(new Bar(), Baz)).toBe(false);
        expect(checkType(new Baz(), Baz)).toBe(true);

        expect(checkType(1, Foo)).toBe(false);
        expect(checkType('1', Foo)).toBe(false);
        expect(checkType(true, Foo)).toBe(false);
    });

    it('checks union', () => {
        expect(checkType(1, ['number', 'string'])).toBe(true);
        expect(checkType('1', ['number', 'string'])).toBe(true);
        expect(checkType(true, ['number', 'string'])).toBe(false);
    });

    describe('arrays', () => {
        it('checks non-arrays', () => {
            expect(checkType(1, {
                _type: 'array',
                _wraps: 'number',
            }));
        });

        it('checks empty arrays', () => {
            expect(checkType([], {
                _type: 'array',
                _wraps: 'number',
            })).toBe(true);
            expect(checkType([], {
                _type: 'array',
                _wraps: 'string',
            })).toBe(true);
        });

        it('checks basic arrays', () => {
            expect(checkType([1, 2, 3], {
                _type: 'array',
                _wraps: 'number',
            })).toBe(true);
            expect(checkType([1, 2, 3], {
                _type: 'array',
                _wraps: 'string',
            })).toBe(false);
        });

        it('checks recursive arrays', () => {
            expect(checkType([[1, 2], [3, 4], []], {
                _type: 'array',
                _wraps: {
                    _type: 'array',
                    _wraps: 'number',
                },
            })).toBe(true);
            expect(checkType([1, 2, 3], {
                _type: 'array',
                _wraps: {
                    _type: 'array',
                    _wraps: 'number',
                },
            })).toBe(false);
        });
    });

    describe('objects', () => {
        it('checks non-objects', () => {
            expect(checkType(1, {
                _type: 'object',
                _wraps: {},
            })).toBe(false);
            expect(checkType([], {
                _type: 'object',
                _wraps: {},
            })).toBe(false);
            expect(checkType(new Foo(), {
                _type: 'object',
                _wraps: {},
            })).toBe(false);
        });

        it('checks unknown keys', () => {
            expect(checkType({ a: 1 }, {
                _type: 'object',
                _wraps: {},
            })).toBe(false);
            expect(checkType({ a: 1 }, {
                _type: 'object',
                _wraps: { a: 'number' },
            })).toBe(true);
        });

        it('checks missing keys', () => {
            expect(checkType({}, {
                _type: 'object',
                _wraps: { a: 'number' },
            })).toBe(false);
            expect(checkType({}, {
                _type: 'object',
                _wraps: {},
            })).toBe(true);
        });

        it('checks basic objects', () => {
            expect(checkType({ a: '1' }, {
                _type: 'object',
                _wraps: {
                    a: 'number',
                },
            })).toBe(false);
            expect(checkType({ a: 1 }, {
                _type: 'object',
                _wraps: {
                    a: 'number',
                },
            })).toBe(true);
        });

        it('checks recursive objects', () => {
            expect(checkType({ a: 1 }, {
                _type: 'object',
                _wraps: {
                    a: {
                        _type: 'object',
                        _wraps: {
                            b: 'number',
                        },
                    },
                },
            })).toBe(false);
            expect(checkType({ a: { b: 1 } }, {
                _type: 'object',
                _wraps: {
                    a: {
                        _type: 'object',
                        _wraps: {
                            b: 'number',
                        },
                    },
                },
            })).toBe(true);
        });

        it('checks implied objects', () => {
            expect(checkType({ type: 1, wraps: true, a: '3' }, {
                type: 'number',
                wraps: 'boolean',
                a: 'string',
            })).toBe(true);
        });
    });

    describe('tuples', () => {
        it('checks non-tuples', () => {
            expect(checkType(1, {
                _type: 'tuple',
                _wraps: ['number', 'string'],
            })).toBe(false);
            expect(checkType({}, {
                _type: 'tuple',
                _wraps: ['number', 'string'],
            })).toBe(false);
            expect(checkType(new Foo(), {
                _type: 'tuple',
                _wraps: ['number', 'string'],
            })).toBe(false);
        });

        it('checks empty tuples', () => {
            expect(checkType([], {
                _type: 'tuple',
                _wraps: [],
            })).toBe(true);
        });

        it('checks wrong length', () => {
            expect(checkType([], {
                _type: 'tuple',
                _wraps: ['number', 'string'],
            })).toBe(false);
            expect(checkType([1], {
                _type: 'tuple',
                _wraps: ['number', 'string'],
            })).toBe(false);
            expect(checkType([1], {
                _type: 'tuple',
                _wraps: [],
            })).toBe(false);
        });

        it('checks basic tuples', () => {
            expect(checkType([1, '1'], {
                _type: 'tuple',
                _wraps: ['number', 'string'],
            })).toBe(true);
            expect(checkType(['1', 1], {
                _type: 'tuple',
                _wraps: ['number', 'string'],
            })).toBe(false);
            expect(checkType([1, '1'], {
                _type: 'tuple',
                _wraps: ['string', 'number'],
            })).toBe(false);
        });

        it('checks recursive tuples', () => {
            expect(checkType(['1', 1], {
                _type: 'tuple',
                _wraps: ['string', { _type: 'tuple', _wraps: ['number'] }],
            })).toBe(false);
            expect(checkType(['1', [1]], {
                _type: 'tuple',
                _wraps: ['string', { _type: 'tuple', _wraps: ['number'] }],
            })).toBe(true);
        });
    });

    describe('mappings', () => {
        it('checks non-mappings', () => {
            expect(checkType(1, {
                _type: 'mapping',
                _wraps: 'number',
            })).toBe(false);
            expect(checkType('1', {
                _type: 'mapping',
                _wraps: 'number',
            })).toBe(false);
            expect(checkType([], {
                _type: 'mapping',
                _wraps: 'number',
            })).toBe(false);
            expect(checkType(new Foo(), {
                _type: 'mapping',
                _wraps: 'number',
            })).toBe(false);
        });

        it('checks basic mapping', () => {
            expect(checkType({ a: 1, b: 2 }, {
                _type: 'mapping',
                _wraps: 'string',
            })).toBe(false);
            expect(checkType({ a: '1', b: 2 }, {
                _type: 'mapping',
                _wraps: 'string',
            })).toBe(false);
            expect(checkType({ a: '1', b: '2' }, {
                _type: 'mapping',
                _wraps: 'string',
            })).toBe(true);
        });

        it('checks recursive mapping', () => {
            expect(checkType({ a: 1, b: 2 }, {
                _type: 'mapping',
                _wraps: {
                    _type: 'mapping',
                    _wraps: 'number',
                },
            })).toBe(false);
            expect(checkType({ a: { foo: 1 }, b: 2 }, {
                _type: 'mapping',
                _wraps: {
                    _type: 'mapping',
                    _wraps: 'number',
                },
            })).toBe(false);
            expect(checkType({ a: { foo: 1 }, b: { bar: 2 } }, {
                _type: 'mapping',
                _wraps: {
                    _type: 'mapping',
                    _wraps: 'number',
                },
            })).toBe(true);
        });
    });
});
