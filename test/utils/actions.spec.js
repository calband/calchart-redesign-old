/**
 * @file Tests the parseAction function.
 */

import parseAction from 'utils/actions';

describe('parseAction', () => {
    it('parses just a name', () => {
        expect(parseAction('foo')).toEqual({
            name: 'foo',
            data: null,
        });
    });

    it('parsing action with no args not allowed', () => {
        expect(() => parseAction('foo()')).toThrow();
    });

    it('parses a name and a string arg', () => {
        expect(parseAction('foo(bar)')).toEqual({
            name: 'foo',
            data: 'bar',
        });
    });

    it('parses a name and an object arg', () => {
        expect(parseAction('foo(bar=1, baz=2)')).toEqual({
            name: 'foo',
            data: {
                bar: 1,
                baz: 2,
            },
        });
    });

    it('parses a name and a JSON null arg', () => {
        expect(parseAction('foo(null)')).toEqual({
            name: 'foo',
            data: null,
        });
    });

    it('parses a name and a JSON number arg', () => {
        expect(parseAction('foo(1)')).toEqual({
            name: 'foo',
            data: 1,
        });
    });

    it('parses a name and a JSON string arg', () => {
        expect(parseAction('foo("bar")')).toEqual({
            name: 'foo',
            data: 'bar',
        });
    });

    it('parses a name and a JSON object arg', () => {
        expect(parseAction('foo({"bar": 1, "baz": 2})')).toEqual({
            name: 'foo',
            data: {
                bar: 1,
                baz: 2,
            },
        });
    });
});
