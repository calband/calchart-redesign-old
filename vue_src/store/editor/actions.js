/**
 * @file Actions that are not saved in History.
 */

import AddSheetPopup from 'popups/AddSheetPopup';
import { showPopup } from 'popups/lib';
import sendAction from 'utils/ajax';
import History from 'utils/History';

/**
 * Redo an action.
 */
export function redo() {
    History.redo();
}

/**
 * Save the current show to the server.
 *
 * @param {Object} options - Options to pass to AJAX.
 */
export function saveShow(context, options) {
    sendAction('save_show', {
        showData: context.rootState.show.serialize(),
    }, options);
}

/**
 * Display the AddSheetPopup.
 */
export function showAddSheet() {
    showPopup(AddSheetPopup);
}

/**
 * Undo an action.
 */
export function undo() {
    History.undo();
}
