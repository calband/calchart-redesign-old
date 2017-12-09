import BaseContinuity from './continuities/BaseContinuity';
import CounterMarchContinuity from './continuities/CounterMarchContinuity';
import DiagonalContinuity from './continuities/DiagonalContinuity';
import EvenContinuity from './continuities/EvenContinuity';
import FollowLeaderContinuity from './continuities/FollowLeaderContinuity';
import ForwardContinuity from './continuities/ForwardContinuity';
import FountainGridContinuity from './continuities/FountainGridContinuity';
import GateTurnContinuity from './continuities/GateTurnContinuity';
import GrapevineContinuity from './continuities/GrapevineContinuity';
import StopContinuity from './continuities/StopContinuity';
import TwoStepContinuity from './continuities/TwoStepContinuity';

/**
 * A proxy class for creating/deserializing all Continuity types, although
 * all Continuity types actually inherit from {@link BaseContinuity}. This
 * proxy class allows for ease of abstraction and prevents circular
 * dependencies.
 */
export default class Continuity {
    /**
     * Create a Continuity of the given type.
     *
     * @param {string} type - The type of Continuity to create (@see
     *   CalchartUtils.CONTINUITIES).
     * @param {Sheet} sheet - The sheet the Continuity is for.
     * @param {DotType} dotType - The dot type the Continuity is for.
     * @return {Continuity}
     */
    static create(type, sheet, dotType) {
        let dots = sheet.getDotsOfType(dotType);
        switch (type) {
            case 'EWNS':
                return new FountainGridContinuity(sheet, dotType, true);
            case 'NSEW':
                return new FountainGridContinuity(sheet, dotType, false);
            case 'FM':
                return new ForwardContinuity(sheet, dotType, 0, 0);
            case 'MT':
                return new StopContinuity(sheet, dotType, true, null);
            case 'CL':
                return new StopContinuity(sheet, dotType, false, null);
            case 'EVEN':
                return new EvenContinuity(sheet, dotType);
            case 'DMHS':
                return new DiagonalContinuity(sheet, dotType, true);
            case 'HSDM':
                return new DiagonalContinuity(sheet, dotType, false);
            case 'FTL':
                return new FollowLeaderContinuity(sheet, dotType, dots, []);
            case 'CM':
                return new CounterMarchContinuity(sheet, dotType, null, dots);
            case 'TWO':
                return new TwoStepContinuity(sheet, dotType, dots, []);
            case 'GT': {
                let reference = sheet.getDotInfo(dots[0]).position;
                return new GateTurnContinuity(sheet, dotType, 90, reference);
            }
            case 'GV':
                return new GrapevineContinuity(sheet, dotType, 0, 90);
        }
        throw new Error('No continuity of the type: ' + type);
    }

    /**
     * Route the deserialization to the appropriate Continuity.
     *
     * @param {Sheet} sheet - The sheet the Continuity is for.
     * @param {DotType} dotType - The dot type the Continuity is for.
     * @param {Object} data - The JSON data to initialize the Continuity with.
     * @return {Continuity}
     */
    static deserialize(sheet, dotType, data) {
        switch (data.type) {
            case 'fountain':
                return FountainGridContinuity.deserialize(sheet, dotType, data);
            case 'fm':
                return ForwardContinuity.deserialize(sheet, dotType, data);
            case 'close':
            case 'mt':
                return StopContinuity.deserialize(sheet, dotType, data);
            case 'even':
                return EvenContinuity.deserialize(sheet, dotType, data);
            case 'diagonal':
                return DiagonalContinuity.deserialize(sheet, dotType, data);
            case 'ftl':
                return FollowLeaderContinuity.deserialize(sheet, dotType, data);
            case 'cm':
                return CounterMarchContinuity.deserialize(sheet, dotType, data);
            case 'two':
                return TwoStepContinuity.deserialize(sheet, dotType, data);
            case 'gate':
                return GateTurnContinuity.deserialize(sheet, dotType, data);
            case 'gv':
                return GrapevineContinuity.deserialize(sheet, dotType, data);
        }
        throw new Error('No continuity of the type: ' + data.type);
    }

    /**
     * Build the movements from the given continuities for the given dot.
     */
    static buildMovements() {
        return BaseContinuity.buildMovements.apply(this, arguments);
    }
}
