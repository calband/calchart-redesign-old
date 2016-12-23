var MovementCommandMove = require("./movements/MovementCommandMove");
var MovementCommandEven = require("./movements/MovementCommandEven");
var MovementCommandStop = require("./movements/MovementCommandStop");

module.exports = {
    /**
     * Routes the deserialization to the appropriate movement command
     *
     * @param {object} data -- the JSON data to initialize the
     *   MovementCommand with
     * @return {BaseMovementCommand} the appropriate movement command
     */
    deserialize: function(data) {
        switch (data.type) {
            case "MovementCommandMove":
                return MovementCommandMove.deserialize(data);
            case "MovementCommandEven":
                return MovementCommandEven.deserialize(data);
            case "MovementCommandStop":
                return MovementCommandStop.deserialize(data);
        }
    },
};
