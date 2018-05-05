/**
 * @file Tests math utility functions.
 */

import { each, map, random, zip } from 'lodash';

import { round } from 'utils/math';

describe('round', () => {
    describe('Basic round tests', () => {
        function check(x, interval, result) {
            it(`round(${x}, ${interval}) == ${result}`, () =>{
                expect(round(x, interval)).toBe(result);
            });
        }

        // round rounds up
        check(10.5, 1, 11);
        check(10.5, 2, 10);
        check(11, 3, 12);
        check(11, 4, 12);
    });

    it('always rounds to a multiple of the interval', () => {
        let xs = map(Array(100), _ => random(1000, true));
        let intervals = map(Array(100), _ => random(1, 100));

        expect.extend({
            toRoundWith(x, interval) {
                const pass = round(x, interval) % interval === 0;
                return {
                    message: () =>
                        `round(${x}, ${interval}) ` +
                        (pass ? 'is' : 'is not') +
                        ` a multiple of the interval`,
                    pass,
                };
            },
        });

        each(zip(xs, intervals), ([x, interval]) =>
            expect(x).toRoundWith(interval)
        );
    });
});
