/**
 * @file Utilities for unit testing.
 */
import $ from 'jquery';
import sinon from 'sinon';
import Vue from 'vue';

import App from 'App';
import { setRoot } from 'utils/vue';

/**
 * An object that can be used to stub context menus.
 */
export const ContextMenuStub = {
    _isContextMenu: true,
    render: function() {},
};

// global setup
beforeEach(() => {
    // automatically set the root for all tests
    let _App = Vue.extend(App);
    setRoot(new _App());

    // stub all ajax calls
    sinon.stub($, 'ajax');
});

// global teardown
afterEach(() => {
    $.ajax.restore();
});
