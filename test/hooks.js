import $ from 'jquery';
import sinon from 'sinon';

// global setup
beforeEach(() => {
    // stub all ajax calls
    sinon.stub($, 'ajax');
});

// global teardown
afterEach(() => {
    $.ajax.restore();
});
