import MovementCommandMove from "calchart/movements/MovementCommandMove";
import MovementCommandEven from "calchart/movements/MovementCommandEven";
import MovementCommandStop from "calchart/movements/MovementCommandStop";

/**
 * A proxy class for creating/deserializing all MovementCommand types, although
 * all MovementCommand types actually inherit from {@link BaseMovementCommand}.
 * This proxy class allows for ease of abstraction and prevents circular
 * dependencies.
 */
export default class MovementCommand {
    /**
     * Route the deserialization to the appropriate MovementCommand.
     *
     * @param {Object} data - The JSON data to initialize the MovementCommand with.
     * @return {MovementCommand}
     */
    static deserialize(sheet, dotType, data) {
        switch (data.type) {
            case "MovementCommandMove":
                return MovementCommandMove.deserialize(data);
            case "MovementCommandEven":
                return MovementCommandEven.deserialize(data);
            case "MovementCommandStop":
                return MovementCommandStop.deserialize(data);
        }
        throw new Error("No movement of the type: " + data.type);
    }
}
