/**
 * Check that the current page has the current name.
 *
 * @param {string} name
 */
Cypress.Commands.add('checkPageIs', name => {
    cy.get('#app').should('have.class', name);
});

/**
 * Create and go to a test show.
 */
Cypress.Commands.add('gotoTestShow', () => {
    cy.visit('/');
    cy.get('[data-cy=new-show]').click();
    cy.get('[name=name]').type('My Show');
    cy.get('[name=numDots]').type('10');
    cy.get('[data-cy=submit]').click();
    cy.checkPageIs('editor');
});
