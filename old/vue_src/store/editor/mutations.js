/**
 * @file Mutations that are not saved in History.
 */

import { clamp } from 'lodash';

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

/**
 * @param {number} delta
 */
export function zoomBy(state, delta) {
    state.zoom = clamp(state.zoom + delta, 0.5, 2);
}

/**
 * @param {number} zoom
 */
export function zoomTo(state, zoom) {
    state.zoom = zoom;
}
