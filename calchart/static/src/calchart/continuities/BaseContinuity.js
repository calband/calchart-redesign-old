var errors = require("calchart/errors");
var HTMLBuilder = require("utils/HTMLBuilder");

/**
 * Represents a continuity for a dot type during a stuntsheet. This is
 * distinct from MovementCommands, as those are per-dot, and describe
 * the exact movement for the dot (e.g. 8E, 4S), whereas Continuities
 * describe movements for the dot type (e.g. EWNS to SS 2).
 *
 * @param {Sheet} sheet -- the sheet the continuity is for
 * @param {string} dotType -- the dot type the continuity is for
 */
var BaseContinuity = function(sheet, dotType) {
    this._sheet = sheet;
    this._dotType = dotType;
};

/**
 * Return the JSONified version of the BaseContinuity. The data needs
 * to define `type`, which is needed to deserialize (see
 * Continuity.deserialize)
 *
 * @return {object} a JSON object containing this Continuity's data
 */
BaseContinuity.prototype.serialize = function() {
    throw new errors.NotImplementedError(this);
};

/**** INSTANCE METHODS ****/

/**
 * Get the movements for the given dot for the given stuntsheet
 *
 * @param {Dot} dot -- the dot to get movements for
 * @param {object} data -- data about the Sheet at the beginning of the
 *   continuity. Includes:
 *     - {Coordinate} position -- the starting position of the dot
 *     - {int} remaining -- the number of beats left in the Sheet
 * @return {Array<MovementCommand>} the movements to do for the dot
 */
BaseContinuity.prototype.getMovements = function(dot, data) {
    throw new errors.NotImplementedError(this);
};

/**
 * @param {EditorController} controller -- the controller for the editor application
 * @return {jQuery} the HTML element to add to the Edit Continuity panel
 */
BaseContinuity.prototype.panelHTML = function(controller) {
    throw new errors.NotImplementedError(this);
};

/**
 * @return {object} data to populate the Edit Continuity popup, with the values:
 *   - {string} name -- the name of the continuity
 *   - {Array<jQuery>} fields -- the fields to add to the form. The fields need
 *     to have their name match the instance variable, e.g. "orientation" for
 *     this._orientation
 */
BaseContinuity.prototype.popupHTML = function() {
    throw new errors.NotImplementedError(this);
};

/**
 * Update this continuity when saving the Edit Continuity popup
 *
 * @param {object} data -- the popup data
 * @return {object} the values that were changed, mapping name
 *   of field to the old value
 */
BaseContinuity.prototype.savePopup = function(data) {
    var _this = this;
    var changed = {};
    $.each(data, function(key, val) {
        var old = _this["_" + key];
        if (old !== val) {
            changed[key] = old;
            _this["_" + key] = val;
        }
    });
    return changed;
};

/**** HELPERS ****/

/**
 * Update the movements for dots that use this continuity. Used in the
 * edit continuity context.
 *
 * @param {EditorController} controller -- the controller for the editor application
 */
BaseContinuity.prototype._updateMovements = function(controller) {
    this._sheet.updateMovements(this._dotType);
    controller.refresh();
};

/**
 * Wrap the given contents to add to the edit continuity panel
 *
 * @param {string} type -- the type of the continuity to add
 * @param {Array<jQuery>} contents -- the jQuery contents
 * @return {jQuery} the HTML element to add to the panel, in the format:
 *
 *   <div class="continuity {type}">
 *       <div class="info">{contents}</div>
 *       <div class="actions">
 *           <i class="icon-pencil"></i>
 *           <i class="icon-times"></i>
 *       </div>
 *   </div>
 */
BaseContinuity.prototype._wrapPanel = function(type, contents) {
    var icon_edit = HTMLBuilder.icon("pencil", "edit");
    var icon_delete = HTMLBuilder.icon("times", "delete");
    var actions = HTMLBuilder.div("actions", [icon_edit, icon_delete]);
    var info = HTMLBuilder.div("info", contents);

    return HTMLBuilder.div("continuity " + type, [info, actions])
        .data("continuity", this);
};

module.exports = BaseContinuity;
