import * as _ from "lodash";

import AnimationState from "calchart/AnimationState";
import Coordinate from "calchart/Coordinate";
import Continuity from "calchart/Continuity";
import Dot from "calchart/Dot";
import DotType from "calchart/DotType";
import MovementCommand from "calchart/MovementCommand";

import { AnimationStateError } from "utils/errors";

/**
 * A Sheet represents a stuntsheet, containing the following information:
 *  - the Show this sheet is a part of
 *  - the index of the Sheet in the Show
 *  - an optional label for the Sheet
 *  - the number of beats in the stuntsheet
 *  - each dot's information (see Sheet.getDotInfo)
 *  - each dot type's continuities
 */
export default class Sheet {
    /**
     * @param {Show} show - The Show this sheet is part of.
     * @param {int} index - The index of this Sheet in the Show.
     * @param {int} numBeats - The number of beats in the stuntsheet.
     * @param {Object} [options] - Optional information about a stuntsheet, such as:
     *   - {string} label - A label for the Sheet.
     *   - {string} fieldType - The field type.
     *   - {(int|string)} beatsPerStep - The default number of beats per step for
     *       continuities in the Sheet, or "default" to get the number of beats per
     *       step from the Show.
     *   - {string} orientation - The default orientation for continuities in the
     *       Sheet, or "default" to get the orientation from the Show.
     *   - {string} stepType - The default step type for continuities in the Sheet,
     *       or "default" to get the step type from the Show.
     */
    constructor(show, index, numBeats, options) {
        this._show = show;
        this._index = index;
        this._numBeats = numBeats;

        options = _.defaults(options, {
            label: null,
            fieldType: null,
            beatsPerStep: "default",
            orientation: "default",
            stepType: "default",
        });

        this._label = options.label;
        this._fieldType = options.fieldType;
        this._beatsPerStep = options.beatsPerStep;
        this._orientation = options.orientation;
        this._stepType = options.stepType;

        // map dot labels to their info for the sheet. See Sheet.getDotInfo
        this._dots = {};

        // map dot type to Continuities
        this._continuities = {};
    }

    /**
     * Create a stuntsheet from the given number of beats and the given
     * dot labels.
     *
     * @param {Show} show
     * @param {int} index
     * @param {int} numBeats
     * @param {string[]} dotLabels - The labels for the dots in the show.
     * @return {Sheet}
     */
    static create(show, index, numBeats, dotLabels) {
        let sheet = new Sheet(show, index, numBeats);

        // initialize dots as plain dots
        dotLabels.forEach(dot => {
            sheet._dots[dot] = {
                type: DotType.PLAIN,
                position: new Coordinate(0, 0),
                movements: [],
            };
        });

        sheet._continuities[DotType.PLAIN] = [];

        return sheet;
    }

    /**
     * Create a Sheet from the given serialized data
     *
     * @param {Show} show
     * @param {Object} data - The JSON data to initialize the Sheet with.
     * @return {Sheet}
     */
    static deserialize(show, data) {
        let sheet = new Sheet(show, data.index, data.numBeats, data.options);

        _.each(data.dots, function(dot_data, label) {
            sheet._dots[label] = {
                type: dot_data.type,
                position: Coordinate.deserialize(dot_data.position),
                movements: dot_data.movements.map(
                    movement_data => MovementCommand.deserialize(movement_data)
                ),
            };
        });

        _.each(data.continuities, function(continuities_data, dot_type) {
            sheet._continuities[dot_type] = continuities_data.map(
                data => Continuity.deserialize(sheet, dot_type, data)
            );
        });

        return sheet;
    }

    /**
     * Return the JSONified version of the Sheet.
     *
     * @return {Object}
     */
    serialize() {
        let data = {
            numBeats: this._numBeats,
            index: this._index,
        };

        data.options = {
            label: this._label,
            fieldType: this._fieldType,
            beatsPerStep: this._beatsPerStep,
            orientation: this._orientation,
            stepType: this._stepType,
        };
        
        data.dots = {};
        _.each(this._dots, function(data, label) {
            data.dots[label] = {
                type: data.type,
                position: data.position.serialize(),
                movements: data.movements.map(movement => movement.serialize()),
            };
        });

        data.continuities = {};
        _.each(this._continuities, function(continuities, dotType) {
            data.continuities[dotType] = continuities.map(continuity => continuity.serialize());
        });

        return data;
    }

    /**
     * Add the given continuity to the given dot type.
     *
     * @param {string} dotType
     * @param {BaseContinuity} continuity
     */
    addContinuity(dotType, continuity) {
        this._continuities[dotType].push(continuity);
        this.updateMovements(dotType);
    }

    /**
     * Change the dot types of the given dots.
     *
     * @param {Dot[]} dots - The dots to change dot types.
     * @param {string} dotType - The dot type to change to.
     */
    changeDotTypes(dots, dotType) {
        dots.forEach(dot => {
            let label = dot.getLabel();
            this._dots[label].type = dotType;
        });

        if (_.isUndefined(this._continuities[dotType])) {
            this._continuities[dotType] = [];
        }

        this.updateMovements(dots);
    }

    /**
     * Return an AnimationState object that describes the given Dot's position,
     * orientation, etc. for the Sheet.
     *
     * @param {Dot} dot
     * @param {int} beatNum - The beat to get the state for.
     * @return {AnimationState} An AnimationState that describes the given Dot at
     *   a moment of the show. If the Dot has no position at the specified beat,
     *   throw an AnimationStateError.
     */
    getAnimationState(dot, beatNum) {
        let label = dot.getLabel();
        let movements = this._dots[label].movements;
        let remaining = beatNum;

        for (let i = 0; i < movements.length; i++) {
            let movement = movements[i];
            let duration = movement.getDuration();
            if (remaining <= duration) {
                return movement.getAnimationState(remaining);
            } else {
                remaining -= duration;
            }
        }

        throw new AnimationStateError(
            `Ran out of movements for ${label}: ${remaining} beats remaining`
        );
    }

    /**
     * Get the number of beats per step for this sheet, resolving any defaults.
     *
     * @return {int}
     */
    getBeatsPerStep() {
        return this._beatsPerStep === "default" ? this._show.getBeatsPerStep() : this._beatsPerStep;
    }

    /**
     * Get the continuities for the given dot type.
     *
     * @param {string} dotType
     * @return {Continuity[]}
     */
    getContinuities(dotType) {
        return this._continuities[dotType];
    }

    /**
     * Get the info for the given Dot for this stuntsheet.
     *
     * @param {(Dot|string)} dot - The dot or dot label to retrieve info for.
     * @return {Object} The dot's information for this stuntsheet, containing:
     *   - {DotType} type - The dot's type.
     *   - {Coordinate} position - The dot's starting position.
     *   - {MovementCommand[]} movements - The dot's movements in the sheet.
     */
    getDotInfo(dot) {
        if (dot instanceof Dot) {
            dot = dot.getLabel();
        }
        return this._dots[dot];
    }

    /**
     * Get all dots of the given dot type.
     *
     * @param {string} dotType
     * @return {Dot[]}
     */
    getDotsOfType(dotType) {
        let dotTypeDots = [];

        _.each(this._dots, (info, label) => {
            if (info.type === dotType) {
                dotTypeDots.push(this._show.getDotByLabel(label));
            }
        });

        return dotTypeDots;
    }

    /**
     * Get the dot type of the given dot.
     *
     * @param {(Dot|string)} dot - The dot or dot label to get the dot type of.
     * @return {DotType}
     */
    getDotType(dot) {
        return this.getDotInfo(dot).type;
    }

    /**
     * @return {DotType[]} The dot types in this sheet, sorted by DotType.
     */
    getDotTypes() {
        let dotTypes = _.map(_.values(this._dots), "type");
        return DotType.sort(new Set(dotTypes));
    }

    /**
     * @return {int} The number of beats in the Sheet.
     */
    getDuration() {
        return this._numBeats;
    }

    /**
     * @return {string} The field type for the stuntsheet, defaulting to the field
     *   type of the Show.
     */
    getFieldType() {
        return _.defaultTo(this._fieldType, this._show.getFieldType());
    }

    /**
     * Get the position of the given dot at the end of the sheet.
     *
     * @param {(Dot|string)} dot - The dot or dot label.
     * @return {Coordinate} The final position of the dot in the sheet.
     */
    getFinalPosition(dot) {
        let dotInfo = this.getDotInfo(dot);
        let movement = _.last(dotInfo.movements);
        if (_.isUndefined(movement)) {
            return dotInfo.position;
        } else {
            return movement.getEndPosition();
        }
    }

    /**
     * @return {int} The index of this sheet.
     */
    getIndex() {
        return this._index;
    }

    /**
     * @return {string} The label for this Sheet, either the custom label or
     * the sheet index in the given Show.
     */
    getLabel() {
        return _.defaultTo(this._label, String(this._index + 1));
    }

    /**
     * @return {?Sheet} The sheet after this sheet in the show, or null if this
     *   is the last sheet.
     */
    getNextSheet() {
        return this._show.getSheets()[this._index + 1] || null;
    }

    /**
     * @return {int} The sheet's orientation, defaulting to the Show's orientation, in
     *   Calchart degrees
     */
    getOrientation() {
        switch (this._orientation) {
            case "default":
                return this._show.getOrientation();
            case "east":
                return 0;
            case "west":
                return 90;
        }
        throw new Error(`Invalid orientation: ${this._orientation}`);
    }

    /**
     * Get the position of the dot at the beginning of the sheet.
     *
     * @param {(Dot|string)} dot - The dot or dot label.
     * @return {Coordinate} The initial position of the dot in the sheet.
     */
    getPosition(dot) {
        return this.getDotInfo(dot).position;
    }

    /**
     * @return {?Sheet} The sheet before this sheet in the show, or null if
     *   this is the first sheet.
     */
    getPrevSheet() {
        return this._show.getSheets()[this._index - 1] || null;
    }

    /**
     * @return {string} The sheet's step type, defaulting to the show's step type.
     *   (@see CalchartUtils.STEP_TYPES)
     */
    getStepType() {
        return this._stepType === "default" ? this._show.getStepType() : this._stepType;
    }

    /**
     * @return {boolean} true if this Sheet is the last sheet in the Show.
     */
    isLastSheet() {
        return this._index === this._show.getSheets().length - 1;
    }

    /**
     * Remove the given continuity from the given dot type.
     *
     * @param {string} dotType
     * @param {Continuity} continuity
     */
    removeContinuity(dotType, continuity) {
        let continuities = this._continuities[dotType];
        _.pull(continuities, continuity);
        this.updateMovements(dotType);
    }

    /**
     * Updates the index of the Sheet
     *
     * @param {int} index
     */
    setIndex(index) {
        this._index = index;
    }

    /**
     * Update the movements for the given dots.
     *
     * @param {(string|Dot|Array<Dot>)} [dots] - The dots to update movements for, as
     *   either the dot type, the Dot, or a list of Dots. If undefined, updates all dots.
     */
    updateMovements(dots) {
        if (_.isString(dots)) {
            dots = this.getDotsOfType(dots);
        } else if (_.isUndefined(dots)) {
            dots = this._show.getDots();
        } else if (dots instanceof Dot) {
            dots = [dots];
        }

        dots.forEach(dot => {
            let continuities = this._continuities[this.getDotType(dot)];
            let info = this.getDotInfo(dot);
            let data = {
                position: info.position,
                remaining: this._numBeats,
            };

            info.movements = _.flatMap(continuities, continuity => {
                let moves = continuity.getMovements(dot, data);
                moves.forEach(movement => {
                    data.position = movement.getEndPosition();
                    data.remaining -= movement.getDuration();
                });
                return moves;
            });
        });
    }

    /**
     * Update the position of the given Dot.
     *
     * @param {Dot} dot
     * @param {int} x - The x-coordinate of the new position, in steps.
     * @param {int} y - The y-coordinate of the new position, in steps.
     */
    updatePosition(dot, x, y) {
        let coordinate = this.getDotInfo(dot).position;
        coordinate.x = x;
        coordinate.y = y;
    }
}
