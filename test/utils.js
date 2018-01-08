/**
 * @file Utilities for unit testing. Needs to be imported in every test file
 *   to include the global setup/teardown hooks.
 */
import $ from 'jquery';
import { extend, isUndefined } from 'lodash';
import sinon from 'sinon';

import router from 'router';
import store from 'store';

/**
 * A stubbed Vuex store.
 */
const TEST_STORE = sinon.stub(store);

/**
 * Wrap a `shallow` call to add mocks.
 *
 * @param {Function} f - The possibly-wrapped shallow function.
 * @param {Object} mocks - The mocks to add to the options.
 * @return {Function}
 */
function _addMocks(f, mocks) {
    return (App, options={}) => {
        if (isUndefined(options.mocks)) {
            options.mocks = mocks;
        } else {
            extend(options.mocks, mocks);
        }
        return f(App, options);
    };
}

/**
 * Wrap a `shallow` call to mock the vue-router router.
 *
 * @param {Function} f - The possibly-wrapped shallow function
 * @return {Function}
 */
export function addRouter(f) {
    return _addMocks(f, { _route: router });
}

/**
 * Wrap a `shallow` call to mock the Vuex store.
 *
 * @param {Function} f - The possibly-wrapped shallow function
 * @return {Function}
 */
export function addStore(f) {
    return _addMocks(f, { $store: TEST_STORE });
}

/**
 * An object that can be used to stub context menus.
 */
export const ContextMenuStub = {
    _isContextMenu: true,
    render: function() {},
};

/**
 * Set the value of isStunt in every test in the current test suite.
 *
 * @param {boolean} value
 */
export function setStunt(value) {
    let stub;

    beforeEach(() => {
        stub = sinon.stub(TEST_STORE.state.env, 'isStunt').value(value);
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
