var HTMLBuilder = require("utils/HTMLBuilder");

/**
 * Represents a continuity for a dot type during a stuntsheet. This is
 * distinct from MovementCommands, as those are per-dot, and describe
 * the exact movement for the dot (e.g. 8E, 4S), whereas Continuities
 * describe movements for the dot type (e.g. EWNS to SS 2).
 */
var BaseContinuity = function() {
};

/**
 * Return the JSONified version of the BaseContinuity. The data needs
 * to define `type`, which is needed to deserialize (see
 * Continuity.deserialize)
 *
 * @return {object} a JSON object containing this Continuity's data
 */
BaseContinuity.prototype.serialize = function() {
    throw new Error(this.constructor.name + " did not define serialize");
};

/**** INSTANCE METHODS ****/

/**
 * Get the movements for the given dot for the given stuntsheet
 *
 * @param {Sheet} sheet -- the sheet the continuity is being executed for
 * @param {Dot} dot -- the dot the continuity is assigned to
 * @param {Coordinate} start -- the starting position of the movement
 * @return {Array<MovementCommand>} the movements to do for the dot
 */
BaseContinuity.prototype.getMovements = function(sheet, dot, start) {
    throw new Error(this.constructor.name + " did not define getMovements");
};

/**
 * @param {Sheet} sheet -- the currently active Sheet
 * @return {jQuery} the HTML element to add to the Edit Continuity panel
 */
BaseContinuity.prototype.panelHTML = function(sheet) {
    throw new Error(this.constructor.name + " did not define panelHTML");
};

/**
 * @return {object} data to populate the Edit Continuity popup, with the values:
 *   - {string} name -- the name of the continuity
 *   - {Array<jQuery>} fields -- the fields to add to the form
 */
BaseContinuity.prototype.popupHTML = function() {
    throw new Error(this.constructor.name + " did not define popupHTML");
};

/**
 * Update this continuity when saving the Edit Continuity popup
 *
 * @param {object} data -- the popup data
 * @return {function|undefined} an optional callback function to run any actions
 *   on the continuity in the Edit Continuity panel
 */
BaseContinuity.prototype.savePopup = function(data) {
    throw new Error(this.constructor.name + " did not define savePopup");
};

/**** HELPERS ****/

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
