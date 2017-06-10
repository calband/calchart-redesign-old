import { NotImplementedError } from "utils/errors";

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
     *   - {string} customText - Custom continuity text to override the default
     *     text that should be shown for the continuity.
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
     * @return {EditContinuityPopup}
     */
    static get popupClass() {
        throw new NotImplementedError(this);
    }

    /**
     * Build the movements from the given continuities for the given dot.
     *
     * @param {Continuity[]} continuities
     * @param {Dot} dot
     * @param {Coordinate} start - The starting position of the dot.
     * @param {int} duration - The number of beats to use for the movements.
     */
    static buildMovements(continuities, dot, start, duration) {
        // getMovements() can modify anything passed in
        start = _.clone(start);

        return _.flatMap(continuities, continuity => {
            if (duration <= 0) {
                return [];
            }

            let moves = continuity.getMovements(dot, {
                position: start,
                remaining: duration,
            });

            moves.forEach(movement => {
                start = movement.getEndPosition();
                duration -= movement.getDuration();
            });

            return moves;
        });
    }

    // getter methods to access raw properties instead of resolving defaults
    get beatsPerStep() { return this._beatsPerStep; }
    get orientation() { return this._orientation; }
    get stepType() { return this._stepType; }

    get dotType() {
        return this._dotType;
    }

    /**
     * @return {object} meta info for this continuity, including the following keys:
     *   - {string} type - The short, unique ID of the continuity; e.g. "fm"
     *   - {string} name - The name of the continuity; e.g. "Forward March"
     *   - {string} label - The label for the continuity to use in the panel; e.g. "FM"
     */
    get info() {
        throw new NotImplementedError(this);
    }

    get sheet() {
        return this._sheet;
    }

    /**** METHODS ****/

    /**
     * Clone the given property, being careful to not clone any foreign keys.
     *
     * @param {string} key - The property to clone, such as "_sheet"
     * @param {*} val - The value of the property (equivalent to this[key]).
     * @return {undefined|*} The value to use for this property in the cloned
     *   continuity. If undefined, will be cloned as normal.
     */
    clone(key, val) {
        switch (key) {
            case "_sheet":
                return null; // set manually later
        }
    }

    /**
     * Get the number of beats per step for this continuity, resolving any defaults.
     *
     * @return {int}
     */
    getBeatsPerStep() {
        return this._beatsPerStep === "default" ?
            this.sheet.getBeatsPerStep() : this._beatsPerStep;
    }

    /**
     * @return {string} The continuity text to be displayed for this continuity, assuming
     *   this is a sheet after this sheet.
     */
    getContinuityText() {
        throw new NotImplementedError(this);
    }

    /**
     * @return {string}
     */
    getCustomText() {
        return this._customText;
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
     * @return {string}
     */
    getOrientation() {
        switch(this.getOrientationDegrees()) {
            case 0:
                return "E";
            case 180:
                return "W";
            default:
                return undefined;
        }
    }

    /**
     * Get this continuity's orientation, resolving any defaults.
     *
     * @return {int} The orientation, in Calchart degrees
     */
    getOrientationDegrees() {
        switch (this._orientation) {
            case "default":
                return this.sheet.getOrientationDegrees();
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
     * @param {ContinuityContext} context
     * @return {jQuery[]}
     */
    getPanel(context) {
        return [];
    }

    /**
     * Get this continuity's step type, resolving any defaults.
     *
     * @return {string} Step type (see CalchartUtils.STEP_TYPES).
     */
    getStepType() {
        return this._stepType === "default" ? this.sheet.getStepType() : this._stepType;
    }

    /**
     * @return {string} The continuity text to be displayed for this continuity.
     */
    getText() {
        if (this._customText.length === 0 && !this.sheet.isLastSheet()) {
            return this.getContinuityText();
        } else {
            return this.getCustomText();
        }
    }

    /**
     * Sets the sheet this continuity is a part of. Used when cloning a Sheet.
     *
     * @param {Sheet} sheet
     */
    setSheet(sheet) {
        this._sheet = sheet;
    }

    /**** HELPERS ****/

    /**
     * Get the position of the given dot in the next Sheet.
     *
     * @param {Dot} dot
     * @return {?Coordinate} null if this continuity's sheet is the last sheet.
     */
    _getNextPosition(dot) {
        let nextSheet = this.sheet.getNextSheet();
        if (nextSheet) {
            return nextSheet.getPosition(dot);
        } else {
            return null;
        }
    }

    /**
     * Update the movements for dots that use this continuity. Used in the
     * ContinuityContext.
     *
     * @param {ContinuityContext} context
     */
    _updateMovements(context) {
        this.sheet.updateMovements(this.dotType);
        context.refresh("grapher");
    }
}
