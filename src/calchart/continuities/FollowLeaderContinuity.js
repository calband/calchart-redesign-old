import BaseContinuity from "calchart/continuities/BaseContinuity";
import MovementCommandMove from "calchart/movements/MovementCommandMove";

/**
 * A follow-the-leader continuity, where the sequence of dots is defined and
 * the path for the first dot is marked.
 */
export default class FollowLeaderContinuity extends BaseContinuity {
    /**
     * @param {Sheet} sheet
     * @param {DotType} dotType
     * @param {Dot[]} order - The order of Dots in the line
     * @param {Coordinate[]} path - The coordinates for the path of the first dot
     * @param {object} [options] - Options for the continuity, including:
     *   - {string} stepType
     *   - {int} beatsPerStep
     */
    constructor(sheet, dotType, order, path, options) {
        super(sheet, dotType, options);

        this._order = order;
        this._path = path;
    }

    static deserialize(sheet, dotType, data) {
        return new FollowLeaderContinuity(sheet, dotType, data.order, data.path, data);
    }

    serialize() {
        return super.serialize("FTL", {
            order: this._order,
            path: this._path,
        });
    }

    panelHTML(controller) {
        // let _this = this;

        // let label = HTMLBuilder.span("Move");

        // let steps = HTMLBuilder.input({
        //     class: "panel-continuity-duration",
        //     type: "number",
        //     initial: this._numSteps,
        //     change: function() {
        //         _this._numSteps = validatePositive(this);
        //         _this._updateMovements(controller);
        //     },
        // });

        // let direction = HTMLBuilder.select({
        //     options: GV_DIRECTIONS,
        //     initial: this._direction,
        //     change: function() {
        //         _this._direction = parseNumber($(this).val());
        //         _this._updateMovements(controller);
        //     },
        // });

        // return this._wrapPanel("gv", [label, steps, direction]);
    }

    popupHTML() {
        // TODO
    }

    _getPopupFields() {
        // let fields = super._getPopupFields();

        // fields.steps = HTMLBuilder.formfield("Number of steps", HTMLBuilder.input({
        //     type: "number",
        //     initial: this._numSteps,
        // }), "numSteps");

        // fields.direction = HTMLBuilder.formfield("Direction", HTMLBuilder.select({
        //     options: GV_DIRECTIONS,
        //     initial: this._direction,
        // }));

        // delete fields.orientation;

        // return fields;
    }
}
