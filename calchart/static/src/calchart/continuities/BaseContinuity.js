var HTMLBuilder = require("../../utils/HTMLBuilder");

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
 * Append this continuity to the list of continuities
 *
 * @param {jQuery} continuities -- the list of continuities to append this
 *   continuity to
 */
BaseContinuity.prototype.appendTo = function(continuities) {
    throw new Error(this.constructor.name + " did not define html");
};

/**
 * Get the movements for the given dot for the given stuntsheet
 *
 * @param {Sheet} sheet -- the sheet the continuity is being executed for
 * @param {Dot} dot -- the dot the continuity is assigned to
 * @return {Array<MovementCommand>} the movements to do for the dot
 */
BaseContinuity.prototype.getMovements = function(sheet, dot) {
    throw new Error(this.constructor.name + " did not define getMovements");
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
 *       <i class="icon-times"></i>
 *   </div>
 */
BaseContinuity.prototype._wrapHTML = function(type, contents) {
    var icon = HTMLBuilder.icon("times");
    var info = HTMLBuilder.div("info", contents);

    return HTMLBuilder.div("continuity " + type, [info, icon]);
};

module.exports = BaseContinuity;
