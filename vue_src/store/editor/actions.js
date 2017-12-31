/**
 * @file Actions that are not saved in History.
 */

import { defaultTo } from 'lodash';

import AddSheetPopup from 'popups/AddSheetPopup';
import { showPopup } from 'popups/lib';
import sendAction from 'utils/ajax';
import History from 'utils/History';
import { uniqueId } from 'utils/JSUtils';

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
    context.dispatch('messages/showMessage', 'Saving...', { root: true });

    options = options || {};
    let oldSuccess = defaultTo(options.success, () => {});
    options.success = () => {
        oldSuccess();
        context.dispatch('messages/showMessage', 'Saved!', { root: true });
    };

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
