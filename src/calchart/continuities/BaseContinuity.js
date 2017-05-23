import { STEP_TYPES, ORIENTATIONS } from "utils/CalchartUtils";
import { NotImplementedError, ValidationError } from "utils/errors";
import HTMLBuilder from "utils/HTMLBuilder";
import { setDefaults, underscoreKeys, update } from "utils/JSUtils";

/**
 * Represents a Continuity for a dot type during a stuntsheet. This is
 * distinct from MovementCommands, as those are per-dot, and describe
 * the exact movement for the dot (e.g. 8E, 4S), whereas Continuities
 * describe movements for the dot type (e.g. EWNS to SS 2).
 */
export default class BaseContinuity {
    /**
     * @param {Sheet} sheet - The Sheet the Continuity is for.
     * @param {DotType} dotType - The dot type the continuity is for.
     * @param {Object} [options] - Options for most/all continuities. Can either
     *   be the given type or the string "default", which will be resolved by getting
     *   the value from the Sheet. Possible options include:
     *   - {string} stepType - The step type to march, like high step, show high.
     *   - {int} beatsPerStep - The number of beats per each step of the movement.
     *   - {string} orientation - Orientation, as either east or west. The meaning for
     *     this option is different for each continuity.
     */
    constructor(sheet, dotType, options={}) {
        this._sheet = sheet;
        this._dotType = dotType;

        options = _.defaults({}, options, {
            stepType: "default",
            beatsPerStep: "default",
            orientation: "default",
            customText: "",
        });

        this._stepType = options.stepType;
        this._beatsPerStep = options.beatsPerStep;
        this._orientation = options.orientation;
        this._customText = options.customText;
    }

    /**
     * Create a Continuity from the given serialized data.
     *
     * @param {Sheet} sheet
     * @param {DotType} dotType
     * @param {Object} data - The JSON data to initialize the Continuity with.
     * @return {Continuity}
     */
    static deserialize(sheet, dotType, data) {
        throw new NotImplementedError(this);
    }

    /**
     * Return the JSONified version of the BaseContinuity.
     *
     * @param {Object} [data] - Additional data to add to the serialized data.
     *   Can be used by subclasses to easily add data to the serialization.
     * @return {Object}
     */
    serialize(data={}) {
        return _.extend({}, data, {
            type: this.info.type,
            stepType: this._stepType,
            beatsPerStep: this._beatsPerStep,
            orientation: this._orientation,
            customText: this._customText,
        });
    }

    /**
     * @return {object} meta info for this continuity, including the following keys:
     *   - {string} type - The short, unique ID of the continuity; e.g. "fm"
     *   - {string} name - The name of the continuity; e.g. "Forward March"
     */
    get info() {
        throw new NotImplementedError(this);
    }

    get dotType() { return this._dotType; }
    get sheet() { return this._sheet; }

    /**
     * Get the number of beats per step for this continuity, resolving any defaults.
     *
     * @return {int}
     */
    getBeatsPerStep() {
        return this._beatsPerStep === "default" ?
            this._sheet.getBeatsPerStep() : this._beatsPerStep;
    }

    /**
     * Get the movements for the given dot for the given stuntsheet.
     *
     * @param {Dot} dot - The dot to get movements for.
     * @param {Object} data - Data about the Sheet at the beginning of the
     *   continuity. Includes:
     *     - {Coordinate} position - The starting position of the dot.
     *     - {int} remaining - The number of beats left in the Sheet.
     * @return {MovementCommand[]}
     */
    getMovements(dot, data) {
        throw new NotImplementedError(this);
    }

    /**
     * Get this continuity's orientation, resolving any defaults.
     *
     * @return {int} The orientation, in Calchart degrees
     */
    getOrientationDegrees() {
        switch (this._orientation) {
            case "default":
                return this._sheet.getOrientationDegrees();
            case "east":
                return 0;
            case "west":
                return 180;
            case "":
                // for EvenContinuity, moving in direction of travel
                return undefined;
        }
        throw new Error("Invalid orientation: " + this._orientation);
    }

    /**
     * Get the HTML elements to add to the ContinuityContext panel.
     *
     * @param {EditorController} controller
     * @return {jQuery[]}
     */
    getPanel(controller) {
        return [];
    }

    /**
     * Get the fields to add to the Edit Continuity popup. The form fields
     * need to have their name match the instance variable, e.g. "orientation"
     * for this._orientation.
     *
     * @return {jQuery[]}
     */
    getPopup() {
        let stepType = HTMLBuilder.formfield("Step type", HTMLBuilder.select({
            options: STEP_TYPES,
            initial: this._stepType,
        }));

        let orientation = HTMLBuilder.formfield("Orientation", HTMLBuilder.select({
            options: ORIENTATIONS,
            initial: this._orientation,
        }));

        // beats per step is a select between default/custom, which disables/enables an
        // input for a custom beats per step
        let beatsPerStep = HTMLBuilder.formfield("Beats per step", HTMLBuilder.select({
            options: {
                default: "Default",
                custom: "Custom",
            },
            change: function() {
                let disabled = $(this).val() !== "custom";
                $(this).siblings("input").prop("disabled", disabled);
            },
            initial: this._beatsPerStep === "default" ? "default" : "custom",
        }));
        HTMLBuilder.input({
            name: "customBeatsPerStep",
            type: "number",
            initial: this.getBeatsPerStep(),
        }).appendTo(beatsPerStep);
        beatsPerStep.find("select").change();

        let customText = HTMLBuilder.formfield(
            "Custom Continuity Text",
            HTMLBuilder.make("textarea").val(this._customText),
            "customText"
        );

        return [stepType, orientation, beatsPerStep, customText];
    }

    /**
     * Get this continuity's step type, resolving any defaults.
     *
     * @return {string} Step type (see CalchartUtils.STEP_TYPES).
     */
    getStepType() {
        return this._stepType === "default" ? this._sheet.getStepType() : this._stepType;
    }

    /**
     * Update this continuity when saving the Edit Continuity popup.
     *
     * @param {Object} data - The popup data.
     * @return {Object} The values that were changed, mapping name
     *   of the field to the old value.
     */
    savePopup(data) {
        return update(this, underscoreKeys(data));
    }

    /**
     * Validate the data when saving the Edit Continuity popup.
     *
     * @param {Object} data
     */
    validatePopup(data) {
        if (data.beatsPerStep === "custom") {
            data.beatsPerStep = parseInt(data.customBeatsPerStep);
            if (_.isNaN(data.beatsPerStep)) {
                throw new ValidationError("Please provide the number of beats per step.");
            } else if (data.beatsPerStep <= 0) {
                throw new ValidationError("Beats per step needs to be a positive integer.");
            }
        }
    }

    /**
     * Update the movements for dots that use this continuity. Used in the
     * edit continuity context.
     *
     * @param {EditorController} controller
     */
    _updateMovements(controller) {
        this._sheet.updateMovements(this._dotType);
        controller.refresh();
    }
}
