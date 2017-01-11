import EvenContinuity from "./continuities/EvenContinuity";
import FountainGridContinuity from "./continuities/FountainGridContinuity";
import ForwardContinuity from "./continuities/ForwardContinuity";
import StopContinuity from "./continuities/StopContinuity";

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
     * @param {string} type - The type of Continuity to create (see partials/panel_edit_continuity.html).
     * @param {Sheet} sheet - The sheet the Continuity is for.
     * @param {DotType} dotType - The dot type the Continuity is for.
     * @return {Continuity}
     */
    static create(type, sheet, dotType) {
        switch (type) {
            case "EWNS":
                return new FountainGridContinuity(sheet, dotType, true);
            case "NSEW":
                return new FountainGridContinuity(sheet, dotType, false);
            case "FM":
                return new ForwardContinuity(sheet, dotType, 0, 0);
            case "MT":
                return new StopContinuity(sheet, dotType, true, 0);
            case "MTRM":
                return new StopContinuity(sheet, dotType, true, null);
            case "CL":
                return new StopContinuity(sheet, dotType, false, null);
            case "EVEN":
                return new EvenContinuity(sheet, dotType);
        }
        throw new Error("No continuity of the type: " + type);
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
            case "FOUNTAIN":
                return FountainGridContinuity.deserialize(sheet, dotType, data);
            case "FORWARD":
                return ForwardContinuity.deserialize(sheet, dotType, data);
            case "STOP":
                return StopContinuity.deserialize(sheet, dotType, data);
            case "EVEN":
                return EvenContinuity.deserialize(sheet, dotType, data);
        }
        throw new Error("No continuity of the type: " + data.type);
    }
}
