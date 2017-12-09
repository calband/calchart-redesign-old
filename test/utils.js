/**
 * @file Utilities for unit testing. Needs to be imported in every test file
 *   to include the global setup/teardown hooks.
 */
import $ from 'jquery';
import _ from 'lodash';
import sinon from 'sinon';

import store from 'store';

/**
 * An object that can be used to stub context menus.
 */
export const ContextMenuStub = {
    _isContextMenu: true,
    render: function() {},
};

/**
 * An object to use to mock the Vuex Store.
 */
export const $store = sinon.stub(store);

/**
 * Set the value of isStunt in every test in the current test suite.
 *
 * @param {boolean} value
 */
export function setStunt(value) {
    let stub;

    beforeEach(() => {
        stub = sinon.stub($store.state.env, 'isStunt').value(value);
    });

    afterEach(() => {
        stub.restore();
    });
}

/**
 * Stub a POST action sent to the server.
 *
 * @param {String} action - Validates that the POST action matches this value.
 * @param {Function} callback - The callback to run instead of the AJAX call.
 *   Will receive the data passed to the action. Should return the result of
 *   the AJAX call.
 */
export function stubAction(action, callback) {
    $.ajax.callsFake(options => {
        expect(options.data.get('action')).toBe(action);
        expect(options.data.has('csrfmiddlewaretoken')).toBe(true);
        let data = options.data.get('data');
        let result = callback(JSON.parse(data));
        options.success(result);
    });
}
