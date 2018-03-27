/**
 * @file Tests a Coordinate class.
 */

import { StepCoordinate } from 'calchart/Coordinate';

describe('Coordinate', () => {
    it('initializes', () => {
        expect(() => new StepCoordinate({ x: 1, y: 2 })).not.toThrow();
        expect(() => new StepCoordinate(1, 2)).not.toThrow();
    });

    it('exposes coordinates', () => {
        let coord = new StepCoordinate(1, 2);
        expect(coord.x).toBe(1);
        expect(coord.y).toBe(2);
    });

    it('cannot set coordinates', () => {
        let coord = new StepCoordinate(1, 2);
        expect(() => { coord.x = 5; }).toThrow();
        expect(() => { coord.y = 5; }).toThrow();
    });

    it('deserializes', () => {
        let coord = new StepCoordinate(1, 2);
        expect(StepCoordinate.deserialize(coord.serialize())).toEqual(coord);
    });
});
