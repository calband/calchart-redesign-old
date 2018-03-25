/**
 * @file Tests the Enum class.
 */

import { isSubClass } from 'utils/classes';
import Enum from 'utils/Enum';

class Color extends Enum {
    static get foo() {
        return 1;
    }
    static getBar() {
        return 2;
    }
    get baz() {
        return 3;
    }
    getQuuz() {
        return 4;
    }
}

Color.initEnum(['red', 'blue', { value: 'green', label: 'Greeny' }]);

describe('Enum', () => {
    it('satisfies basic enum properties', () => {
        expect(isSubClass(Color, Enum)).toBe(true);
        expect(Color.RED).toBe(Color.RED);
        expect(Color.RED).toBeInstanceOf(Color);
        expect(Color.RED.value).toBe('red');
        expect(Color.RED.label).toBe('Red');
        expect(Color.BLUE.value).toBe('blue');
        expect(Color.BLUE.label).toBe('Blue');
        expect(Color.GREEN.value).toBe('green');
        expect(Color.GREEN.label).toBe('Greeny');
        expect(Color.values).toEqual([Color.RED, Color.BLUE, Color.GREEN]);
    });

    it('maintains original functions', () => {
        expect(Color.foo).toBe(1);
        expect(Color.getBar()).toBe(2);
        expect(Color.RED.baz).toBe(3);
        expect(Color.RED.getQuuz()).toBe(4);
    });

    describe('fromValue', () => {
        it('converts string', () => {
            expect(Color.fromValue('red')).toBe(Color.RED);
            expect(Color.fromValue(Color.RED.value)).toBe(Color.RED);
        });
        it('converts enum value', () => {
            expect(Color.fromValue(Color.RED)).toBe(Color.RED);
        });
        it('handles undefined', () => {
            expect(Color.fromValue(undefined)).toBeUndefined();
        });
        it('handles null', () => {
            expect(Color.fromValue(null)).toBeNull();
        });
        it('handles invalid value', () => {
            expect(() => {
                Color.fromValue('foo');
            }).toThrow();
        });
    });

    it('serializes', () => {
        expect(Color.RED.serialize().value).toBe('red');
    });

    it('deserializes', () => {
        expect(Color.deserialize(Color.RED.serialize())).toBe(Color.RED);
    });
});
