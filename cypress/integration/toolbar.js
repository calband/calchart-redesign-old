/**
 * @file Integration tests related to the editor toolbars.
 */

describe('Toolbars', () => {
    function activateTool(tool) {
        cy.gotoTestShow();
        cy.get(`[data-cy=formation-toolbar] [data-cy=${tool}]`).click();
    }

    describe('Add/Remove Dots', () => {
        beforeEach(() => {
            activateTool('edit-dot');
        });

        it('activates', () => {
            cy.get('[data-cy=formation-toolbar] [data-cy=edit-dot]')
                .should('have.class', 'active');
        });

        it('adds dots', () => {
            cy.get('[data-cy=edit-show-workspace] [data-cy=grapher]')
                .click()
                .within(() => {
                    cy.get('[data-cy=dot]').should('exist');
                });
        });
    });
});
