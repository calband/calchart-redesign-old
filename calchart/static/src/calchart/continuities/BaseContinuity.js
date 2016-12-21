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
 * @return {Array<MovementCommand>} the movements to do for the dot
 */
BaseContinuity.prototype.getMovements = function(sheet, dot) {
    throw new Error(this.constructor.name + " did not define getMovements");
};

/**
 * @return {jQuery} the HTML element to add to the edit continuity panel, of
 *   the format:
 *
 *   <div class="continuity {type}">
 *       <div class="info">{contents}</div>
 *       <i class="icon-times"></i>
 *   </div>
 */
BaseContinuity.prototype.html = function() {
    throw new Error(this.constructor.name + " did not define html");
};

/**** HELPERS ****/

/**
 * Wrap the given contents to add to the edit continuity panel, in
 * the format specified in BaseContinuity.html
 *
 * @param {string} type -- the type of the continuity to add
 * @param {jQuery} contents -- the jQuery contents
 * @return {jQuery} the HTML element to add to the panel
 */
BaseContinuity.prototype._wrapHTML = function(type, contents) {
    var icon = $("<i>").addClass("icon-times");
    var info = $("<div>").addClass("info").append(contents);
    return $("<div>")
        .addClass("continuity " + type)
        .append(info)
        .append(icon);
};

module.exports = BaseContinuity;
