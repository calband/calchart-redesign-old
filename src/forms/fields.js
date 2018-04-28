/**
 * @file Defines helper functions related to form field definitions.
 *
 * See: https://matt-sanders.gitbooks.io/vue-formly/content/v/2.0/how_to_use/
 *  properties_and_options.html#fields
 */

import { each } from 'lodash';

/**
 * Extract all of the initial values from the given field definition.
 *
 * Useful for keeping field definitions and initial values in one location.
 *
 * @param {Object[]} fieldDefs
 * @return {Object}
 */
export function extractInitial(fieldDefs) {
    let model = {};
    each(fieldDefs, fieldDef => {
        model[fieldDef.key] = fieldDef.initial;
    });
    return model;
}
