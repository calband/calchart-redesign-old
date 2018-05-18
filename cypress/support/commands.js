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
 *
 * @param {boolean} [withNewFormation=true] - If true, create a new formation.
 */
Cypress.Commands.add('gotoTestShow', withNewFormation => {
    cy.visit('/');
    cy.get('[data-cy=new-show]').click();
    cy.get('[name=name]').type('My Show');
    cy.get('[name=numDots]').type('10');
    cy.get('[data-cy=submit]').click();
    cy.checkPageIs('editor');

    if (withNewFormation !== false) {
        cy.createFormation('Formation 1');
    }
});

/**
 * Create a Formation with the given name.
 *
 * @param {string} name
 */
Cypress.Commands.add('createFormation', name => {
    cy.get('[data-cy=add-formation]').click();
    cy.get('.popup').should('exist');

    cy.get('.popup input[name=name]').type(name);
    cy.get('.popup [data-cy=popup-submit]').click();
});
