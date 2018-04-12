/**
 * @file Utilities for unit testing. Needs to be imported in every test file
 *   to include the global setup/teardown hooks.
 */
import { createLocalVue, shallow } from '@vue/test-utils';
import $ from 'jquery';
import { defaultTo, each } from 'lodash';
import sinon from 'sinon';

import initStore from 'store';

export const LOCAL_VUE = createLocalVue();
export const TEST_STORE = sinon.stub(initStore(LOCAL_VUE));

// stub components of plugins not used in tests
each(['formly-form', 'router-view', 'router-link'], c => {
    LOCAL_VUE.component(c, { render: h => h('div') });
});

/**
 * Create a wrapper of a component with child components stubbed out.
 *
 * See `@vue/test-utils.shallow` for description of available options. Other
 * options are also available to render Calchart components.
 *
 * @param {Component} component
 * @param {object} options
 *  | {boolean} stubRouter
 *  | {boolean} stubStore
 */
export function shallowCalchart(component, options={}) {
    options.localVue = LOCAL_VUE;
    options.mocks = defaultTo(options.mocks, {});

    if (options.stubStore) {
        options.mocks.$store = TEST_STORE;
        delete options.stubStore;
    }

    return shallow(component, options);
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
 * The given callback will receive the data passed to the action and should
 * return data the server would send back.
 *
 * @param {string} action
 * @param {function(object): object} callback
 */
const STUBBED_ACTIONS = {};
export function stubAction(action, callback) {
    STUBBED_ACTIONS[action] = callback;
    $.ajax.callsFake(options => {
        expect(options.data.has('csrfmiddlewaretoken')).toBe(true);
        let action = options.data.get('action');
        let callback = STUBBED_ACTIONS[action];

        if (callback) {
            let data = options.data.get('data');
            let result = callback(JSON.parse(data));
            options.success(result);
        }
    });
}
