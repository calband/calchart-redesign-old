/**
 * @file Integration tests related to the editor menu.
 */

describe('EditorMenu', () => {
    beforeEach(() => {
        cy.gotoTestShow();
    });

    // TODO: add test for clicking on tab opens menu

    it('does undo/redo', () => {
        cy.get('[data-cy=formation-toolbar] [data-cy=edit-dot]').click();

        const grapher = '[data-cy=edit-show-workspace] [data-cy=grapher]';
        const grapherDots = `${grapher} [data-cy=dot]`;

        cy.get(grapher)
            .click(100, 100)
            .click(150, 100)
            .click(100, 150)
            .click(150, 150);
        cy.get(grapherDots).should('have.length', 4);

        cy.get('[data-cy=undo]').click({ force: true });
        cy.get(grapherDots).should('have.length', 3);

        cy.get('[data-cy=undo]').click({ force: true });
        cy.get(grapherDots).should('have.length', 2);

        cy.get('[data-cy=redo]').click({ force: true });
        cy.get(grapherDots).should('have.length', 3);
    });
});
