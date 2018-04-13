/**
 * Check that the current page has the current name.
 *
 * @param {string} name
 */
Cypress.Commands.add('checkPageIs', name => {
    cy.get('#app').should('have.class', name);
});
