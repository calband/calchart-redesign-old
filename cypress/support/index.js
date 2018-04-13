import './commands';

// Actions to run before each test
beforeEach(() => {
    // Reset the database
    cy.request('POST', '/dev/reset/');
});
