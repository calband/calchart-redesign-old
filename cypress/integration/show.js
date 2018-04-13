/**
 * @file Integration tests related to modifying a Show.
 */

describe('Show', () => {
    it('creates a new Show', () => {
        // home page
        cy.visit('/');
        cy.get('[data-cy=new-show]').click();

        // create show page
        cy.checkPageIs('create-show');
        cy.get('[name=name]').type('My Show');
        cy.get('[name=numDots]').type('10');
        cy.get('[data-cy=submit]').click();

        // should load editor now
        cy.checkPageIs('editor');
    });
});
