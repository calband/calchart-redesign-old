import FormPopup from "popups/FormPopup";

import {
    DEFAULT_CUSTOM,
    DIRECTIONS,
    ENDINGS,
    ORIENTATIONS,
    STEP_TYPES,
} from "utils/CalchartUtils";
import {
    BooleanField,
    ChoiceField,
    ChoiceOrNumberField,
    NumberField,
    TextField,
} from "utils/fields";

/**
 * The superclass for the popups that edit continuities.
 */
class EditContinuityPopup extends FormPopup {
    /**
     * @param {EditorController} controller
     * @param {Continuity} continuity
     */
    constructor(controller, continuity) {
        super();

        this._controller = controller;
        this._continuity = continuity;
    }

    get info() {
        let name = this._continuity.info.name;
        return {
            name: "edit-continuity",
            title: `Edit Continuity: ${name}`,
        };
    }

    getFields() {
        return [
            new ChoiceField("stepType", STEP_TYPES, {
                initial: this._continuity.stepType,
            }),
            new ChoiceField("orientation", ORIENTATIONS, {
                initial: this._continuity.orientation,
            }),
            new ChoiceOrNumberField("beatsPerStep", DEFAULT_CUSTOM, {
                initial: {
                    choice: this._continuity.beatsPerStep === "default" ? "default" : "custom",
                    number: this._continuity.getBeatsPerStep(),
                },
                positive: true,
            }),
            new TextField("customText", {
                label: "Custom Continuity Text",
                initial: this._continuity.getCustomText(),
                required: false,
            }),
        ];
    }

    onInit() {
        this._popup.addClass(`continuity-${this._continuity.info.type}`);
    }

    onSave(data) {
        this._controller.doAction("saveContinuity", [this._continuity, data]);
    }
}

export class EvenContinuityPopup extends EditContinuityPopup {
    getFields() {
        let [stepType, _orientation, beatsPerStep, customText] = super.getFields();

        let orientation = this._continuity.orientation;
        let choices = {
            "direction": "Direction of Travel",
            "default": "Default",
            "east": "East",
            "west": "West",
        };
        let orientationField = new ChoiceField("orientation", choices, {
            initial: orientation === "" ? "direction" : orientation,
        });

        return [stepType, orientationField, beatsPerStep, customText];
    }

    onSave(data) {
        if (data.orientation === "direction") {
            data.orientation = "";
        }

        super.onSave(data);
    }
}

export class FollowLeaderContinuityPopup extends EditContinuityPopup {
    getFields() {
        let [stepType, _orientation, beatsPerStep, customText] = super.getFields();
        return [stepType, beatsPerStep, customText];
    }
}

export class CounterMarchContinuityPopup extends FollowLeaderContinuityPopup {
    getFields() {
        let fields = super.getFields();

        let duration = this._continuity.getDuration();
        let choices = {
            remaining: "Remaining",
            custom: "Custom",
        };
        let durationField = new ChoiceOrNumberField("duration", choices, {
            label: "Number of beats",
            initial: {
                choice: _.isNull(duration) ? "remaining" : "custom",
                number: duration,
            },
            positive: true,
        });

        return [durationField].concat(fields);
    }

    onSave(data) {
        if (data.duration === "remaining") {
            data.duration = null;
        }

        super.onSave(data);
    }
}

export class ForwardContinuityPopup extends EditContinuityPopup {
    getFields() {
        let [stepType, _orientation, beatsPerStep, customText] = super.getFields();

        let steps = new NumberField("numSteps", {
            label: "Number of steps",
            initial: this._continuity.getNumSteps(),
            positive: true,
        });

        let direction = new ChoiceField("direction", DIRECTIONS, {
            initial: this._continuity.getDirection(),
        });

        return [steps, direction, stepType, beatsPerStep, customText];
    }
}

export class GateTurnContinuityPopup extends EditContinuityPopup {
    getFields() {
        let [stepType, _orientation, beatsPerStep, customText] = super.getFields();

        let degrees = this._continuity.getDegrees();
        let degreesField = new NumberField("degrees", {
            label: "Degrees to turn",
            initial: Math.abs(degrees),
            positive: true,
        });

        let choices = {
            CW: "Clockwise",
            CCW: "Counter-clockwise",
        };
        let direction = new ChoiceField("direction", choices, {
            initial: degrees > 0 ? "CW" : "CCW",
        });

        return [degreesField, direction, stepType, beatsPerStep, customText];
    }

    onSave(data) {
        data.degrees *= data.direction === "CW" ? 1 : -1;

        super.onSave(data);
    }
}

export class StopContinuityPopup extends EditContinuityPopup {
    getFields() {
        let [stepType, orientation, beatsPerStep, customText] = super.getFields();

        let duration = this._continuity.getDuration();
        let choices = {
            remaining: "To End",
            custom: "Custom",
        };
        let durationField = new ChoiceOrNumberField("duration", choices, {
            initial: {
                choice: _.isNull(duration) ? "remaining" : "custom",
                number: duration,
            },
            positive: true,
        });

        switch (this._continuity.info.type) {
            case "close":
                return [durationField, orientation, customText];
            case "mt":
                return [durationField, orientation, stepType, beatsPerStep, customText];
        }
    }

    onSave(data) {
        if (data.duration === "remaining") {
            data.duration = null;
        }

        super.onSave(data);
    }
}

export class ToEndContinuityPopup extends EditContinuityPopup {
    getFields() {
        let fields = super.getFields();

        let end = new ChoiceField("end", ENDINGS, {
            initial: this._continuity.getEnd(),
        });

        return [end].concat(fields);
    }
}

export class TwoStepContinuityPopup extends EditContinuityPopup {
    getFields() {
        let [stepType, _orientation, beatsPerStep, customText] = super.getFields();

        let isMarktime = new BooleanField("isMarktime", {
            label: "Marktime first",
            initial: this._continuity.getIsMarktime(),
        });

        return [isMarktime, stepType, beatsPerStep, customText];
    }
}
