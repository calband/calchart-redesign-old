import * as _ from "lodash";

import AnimationState from "calchart/AnimationState";
import Coordinate from "calchart/Coordinate";
import Continuity from "calchart/Continuity";
import Dot from "calchart/Dot";
import DotType from "calchart/DotType";
import MovementCommand from "calchart/MovementCommand";

import { AnimationStateError } from "utils/errors";
import { mapSome, moveElem } from "utils/JSUtils";
import { roundSmall } from "utils/MathUtils";

/**
 * A Sheet represents a stuntsheet, containing the following information:
 *  - the Show this sheet is a part of
 *  - the index of the Sheet in the Show
 *  - an optional label for the Sheet
 *  - the number of beats in the stuntsheet
 *  - the default number of beats per step for continuities in the Sheet
 *  - the default orientation for continuities in the Sheet
 *  - the default step type for continuities in the Sheet
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
     *   - {string} [background] - The URL for the background image (or undefined)
     *   - {string} fieldType - The field type, or "default" to use the same field
     *     type as the Show.
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
            background: undefined,
            fieldType: "default",
            beatsPerStep: "default",
            orientation: "default",
            stepType: "default",
        });

        this._label = options.label;
        this._background = options.background;
        this._fieldType = options.fieldType;
        this._beatsPerStep = options.beatsPerStep;
        this._orientation = options.orientation;
        this._stepType = options.stepType;

        // @type {Object[]} see Sheet.getDotInfo
        this._dots = [];

        // @type {Object.<string, Continuity[]>}
        this._continuities = {};
    }

    /**
     * Create a stuntsheet from the given number of beats and the given
     * number of dots.
     *
     * @param {Show} show
     * @param {int} index
     * @param {int} numBeats
     * @param {int} numDots
     * @return {Sheet}
     */
    static create(show, index, numBeats, numDots) {
        let sheet = new Sheet(show, index, numBeats);

        // initialize dots as plain dots
        sheet._dots = _.range(numDots).map(i => {
            return {
                type: DotType.PLAIN,
                position: new Coordinate(0, 0),
                movements: [],
                collisions: new Set(),
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

        sheet._dots = data.dots.map(dotData => {
            return {
                type: dotData.type,
                position: Coordinate.deserialize(dotData.position),
                movements: dotData.movements.map(
                    movementData => MovementCommand.deserialize(movementData)
                ),
                collisions: new Set(dotData.collisions),
            };
        });

        _.each(data.continuities, function(continuitiesData, dotType) {
            sheet._continuities[dotType] = continuitiesData.map(
                data => Continuity.deserialize(sheet, dotType, data)
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
            background: this._background,
            fieldType: this._fieldType,
            beatsPerStep: this._beatsPerStep,
            orientation: this._orientation,
            stepType: this._stepType,
        };
        
        data.dots = this._dots.map(dotInfo => {
            return {
                type: dotInfo.type,
                position: dotInfo.position.serialize(),
                movements: dotInfo.movements.map(movement => movement.serialize()),
                collisions: Array.from(dotInfo.collisions),
            };
        });

        data.continuities = {};
        _.each(this._continuities, function(continuities, dotType) {
            data.continuities[dotType] = continuities.map(continuity => continuity.serialize());
        });

        return data;
    }

    // getter methods to access raw properties instead of resolving defaults
    get beatsPerStep() { return this._beatsPerStep; }
    get fieldType() { return this._fieldType; }
    get label() { return this._label; }
    get orientation() { return this._orientation; }
    get stepType() { return this._stepType; }

    /**
     * Add the given continuity to the given dot type.
     *
     * @param {DotType} dotType
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
     * @param {DotType} dotType - The dot type to change to.
     */
    changeDotTypes(dots, dotType) {
        dots.forEach(dot => {
            this._dots[dot.id].type = dotType;
        });

        if (_.isUndefined(this._continuities[dotType])) {
            this._continuities[dotType] = [];
        }

        this.updateMovements(dots);
    }

    /**
     * Clone this sheet. The new Sheet's data should be completely disassociated
     * from this sheet (a deep clone); e.g. changing the new Sheet's dot positions
     * should not update this Sheet's dot positions.
     *
     * @return {Sheet}
     */
    clone() {
        // dont clone show
        let show = this._show;
        this._show = null;

        let sheet = _.cloneDeep(this);
        this._show = show;

        sheet._show = show;
        sheet._index = undefined;

        return sheet;
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
        let movements = this.getDotInfo(dot).movements;
        let remaining = beatNum;

        for (let i = 0; i < movements.length; i++) {
            let movement = movements[i];
            let duration = movement.getDuration();

            let beats = roundSmall(remaining - duration);
            if (beats <= 0) {
                return movement.getAnimationState(remaining);
            } else {
                remaining = beats;
            }
        }

        throw new AnimationStateError(
            `Ran out of movements for ${dot.label}: ${remaining} beats remaining`
        );
    }

    /**
     * @return {undefined|Object} the info for the background image, including:
     *   - {string} url
     *   - {number} width
     *   - {number} height
     *   - {number} x - The number of steps from the south endzone
     *   - {number} y - The number of steps from the west sideline
     */
    getBackground() {
        return this._background;
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
     * Get the dots that collide at the given beat.
     *
     * @param {int} beatNum
     * @return {Dot[]}
     */
    getCollisions(beatNum) {
        return mapSome(this._dots, (info, id) => {
            if (info.collisions.has(beatNum)) {
                return this._show.getDot(id);
            }
        });
    }

    /**
     * Get the continuities for the given dot type.
     *
     * @param {DotType} dotType
     * @return {Continuity[]}
     */
    getContinuities(dotType) {
        return this._continuities[dotType];
    }

    /**
     * Get the info for the given Dot for this stuntsheet.
     *
     * @param {Dot} dot - The dot to retrieve info for.
     * @return {Object} The dot's information for this stuntsheet, containing:
     *   - {DotType} type - The dot's type.
     *   - {Coordinate} position - The dot's starting position.
     *   - {MovementCommand[]} movements - The dot's movements in the sheet.
     *   - {Set.<int>} collisions - All beats where this dot collides with another dot.
     */
    getDotInfo(dot) {
        return this._dots[dot.id];
    }

    /**
     * Get all dots of the given dot type.
     *
     * @param {DotType} dotType
     * @return {Dot[]}
     */
    getDotsOfType(dotType) {
        return mapSome(this._dots, (info, i) => {
            if (info.type === dotType) {
                return this._show.getDot(i);
            }
        });
    }

    /**
     * Get the dot type of the given dot.
     *
     * @param {Dot} dot - The dot to get the dot type of.
     * @return {DotType}
     */
    getDotType(dot) {
        return this.getDotInfo(dot).type;
    }

    /**
     * @return {DotType[]} The dot types in this sheet, sorted by DotType.
     */
    getDotTypes() {
        let dotTypes = new Set(_.map(this._dots, "type"));
        return DotType.sort(dotTypes);
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
        return this._fieldType === "default" ? this._show.getFieldType() : this._fieldType;
    }

    /**
     * Get the position of the given dot at the end of the sheet.
     *
     * @param {Dot} dot
     * @return {Coordinate}
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
     * @return {string} The label for this Sheet.
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
     *   Calchart degrees.
     */
    getOrientationDegrees() {
        switch (this._orientation) {
            case "default":
                return this._show.getOrientationDegrees();
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
     * @param {Dot} dot
     * @return {Coordinate}
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
     * @return {boolean} true if this Sheet is the first sheet in the Show.
     */
    isFirstSheet() {
        return this._index === 0;
    }

    /**
     * @return {boolean} true if this Sheet is the last sheet in the Show.
     */
    isLastSheet() {
        return this._index === this._show.getSheets().length - 1;
    }

    /**
     * Move the continuity at the given index to the specified index.
     *
     * @param {DotType} dotType
     * @param {int} from
     * @param {int} to
     */
    moveContinuity(dotType, from, to) {
        let continuities = this._continuities[dotType];
        moveElem(continuities, from, to);
        this.updateMovements(dotType);
    }

    /**
     * Remove the background of the Sheet.
     */
    removeBackground() {
        this._background = undefined;
    }

    /**
     * Remove the given continuity from the given dot type.
     *
     * @param {DotType} dotType
     * @param {Continuity} continuity
     */
    removeContinuity(dotType, continuity) {
        let continuities = this._continuities[dotType];
        _.pull(continuities, continuity);
        this.updateMovements(dotType);
    }

    /**
     * Set the background of the Sheet.
     *
     * @param {string} url
     */
    setBackground(url) {
        this._background = {
            url: url,
            // TODO
            width: undefined,
            height: undefined,
            x: 0,
            y: 0,
        };
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
     * @param {(string|Dot|Dot[])} [dots] - The dots to update movements for, as
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
            let info = this.getDotInfo(dot);
            let continuities = this._continuities[info.type];
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

        // update collisions
        let allDots = this._show.getDots();
        this._dots.forEach(info => info.collisions.clear());

        let updateCollisions = beat => {
            for (let i = 0; i < allDots.length; i++) {
                let dot1 = allDots[i];
                let state1 = this.getAnimationState(dot1, beat);
                for (let j = i + 1; j < allDots.length; j++) {
                    let dot2 = allDots[j];
                    let state2 = this.getAnimationState(dot2, beat);
                    if (
                        Math.abs(state1.x - state2.x) <= 1 &&
                        Math.abs(state1.y - state2.y) <= 1
                    ) {
                        this.getDotInfo(dot1).collisions.add(beat);
                        this.getDotInfo(dot2).collisions.add(beat);
                        break;
                    }
                }
            }
        }

        for (let beat = 0; beat < this._numBeats; beat++) {
            try {
                updateCollisions(beat);
            } catch (e) {
                if (e instanceof AnimationStateError) {
                    // ignore if no movements
                    break;
                } else {
                    throw e;
                }
            }
        }
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
