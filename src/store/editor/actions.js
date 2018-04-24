/**
 * @file Actions that are not saved in History.
 */

import { defaultTo } from 'lodash';

import sendAction from 'utils/ajax';

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

    sendAction('save_show', context.rootState.show.serialize(), options);
}
