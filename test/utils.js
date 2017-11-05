/**
 * @file Utilities for unit testing. Needs to be imported in every test file
 *   to include the global setup/teardown hooks.
 */
import $ from 'jquery';
import _ from 'lodash';
import sinon from 'sinon';
import Vue from 'vue';

import App from 'App';
import store from 'store';
import { setRoot } from 'utils/vue';

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

// global setup
beforeEach(() => {
    // automatically set the root for all tests
    let _App = Vue.extend(App);
    setRoot(new _App({
        store: $store,
    }));

    // stub all ajax calls
    sinon.stub($, 'ajax');
});

// global teardown
afterEach(() => {
    $.ajax.restore();
});
