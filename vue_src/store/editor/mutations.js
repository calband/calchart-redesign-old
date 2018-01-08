/**
 * @file Mutations that are not saved in History.
 */

/**
 * @param {?Sheet} sheet
 */
export function setActiveSheet(state, sheet) {
    state.sheet = sheet;
}

/**
 * @param {Object} data
 */
export function setNewShowData(state, data) {
    state.newShowData = data;
}

/**
 * @param {String} snap
 */
export function setSnap(state, snap) {
    state.snap = parseInt(snap);
}
