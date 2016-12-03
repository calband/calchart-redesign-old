var MovementCommandMove = require("./movements/MovementCommandMove");
var MovementCommandEven = require("./movements/MovementCommandEven");

/**
 * A class that knows all the other MovementCommand classes, for
 * routing purposes. Needs to be separate from BaseMovementCommand
 * because of circular dependencies.
 */
var MovementCommand = function() {
};

/**
 * Routes the deserialization to the appropriate movement command
 *
 * @param {object} data -- the JSON data to initialize the
 *   MovementCommand with
 * @return {BaseMovementCommand} the appropriate movement command
 */
MovementCommand.deserialize = function(data) {
    switch (data.type) {
        case "MovementCommandMove":
            return MovementCommandMove.deserialize(data);
        case "MovementCommandEven":
            return MovementCommandEven.deserialize(data);
    }
};

module.exports = MovementCommand;
