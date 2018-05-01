/**
 * @file Integration tests related to Formations.
 */

describe('Formation', () => {
    it('creates a new Formation', () => {
        cy.gotoTestShow();
        cy.get('[data-cy=formation]').should('not.exist');

        cy.get('[data-cy=add-formation]').click();
        cy.get('.popup').should('exist');

        let formationName = 'Formation 1';
        cy.get('.popup input[name=name]').type(formationName);
        cy.get('.popup [data-cy=popup-submit]').click();

        cy.get('[data-cy=formation]').should('exist');
    });
});
