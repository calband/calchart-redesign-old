/**
 * @file Integration tests related to Formations.
 */

// The graph preview within the Formation.
const formationGraph = '[data-cy=formation-graph]';

describe('Formation', () => {
    it('creates a new Formation', () => {
        cy.gotoTestShow(false);
        cy.get('[data-cy=formation]').should('not.exist');

        cy.createFormation('Formation 1');

        cy.get('[data-cy=formation]').should('exist').within(() => {
            cy.get(formationGraph).should('have.class', 'active');
        });
    });

    it('switches Formations', () => {
        cy.gotoTestShow(false);
        cy.get('[data-cy=formation]').should('not.exist');

        let form1 = 'Formation 1';
        let form2 = 'Formation 2';

        cy.createFormation(form1);
        cy.createFormation(form2);
        cy.contains('[data-cy=formation]', form2).should('exist')
            .within(() => {
                cy.get(formationGraph).should('have.class', 'active');
            });

        cy.contains('[data-cy=formation]', form1).within(() => {
            cy.get(formationGraph).should('not.have.class', 'active')
                .click()
                .should('have.class', 'active');
        });

        cy.contains('[data-cy=formation]', form2).within(() => {
            cy.get(formationGraph).should('not.have.class', 'active')
                .click()
                .should('have.class', 'active');
        });
    });
});
