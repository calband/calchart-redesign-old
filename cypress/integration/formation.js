/**
 * @file Integration tests related to Formations.
 */

function createFormation(formationName) {
    cy.get('[data-cy=add-formation]').click();
    cy.get('.popup').should('exist');

    cy.get('.popup input[name=name]').type(formationName);
    cy.get('.popup [data-cy=popup-submit]').click();
}

// The graph preview within the Formation.
const formationGraph = '[data-cy=formation-graph]';

describe('Formation', () => {
    it('creates a new Formation', () => {
        cy.gotoTestShow();
        cy.get('[data-cy=formation]').should('not.exist');

        createFormation('Formation 1');

        cy.get('[data-cy=formation]').should('exist').within(() => {
            cy.get(formationGraph).should('have.class', 'active');
        });
    });

    it('switches Formations', () => {
        cy.gotoTestShow();
        cy.get('[data-cy=formation]').should('not.exist');

        let form1 = 'Formation 1';
        let form2 = 'Formation 2';

        createFormation(form1);
        createFormation(form2);
        cy.contains('[data-cy=formation]', form2).should('exist')
            .within(() => {
                cy.get(formationGraph).should('have.class', 'active');
            })

        cy.contains('[data-cy=formation]', form1).within(() => {
            cy.get(formationGraph).should('not.have.class', 'active')
                .click()
                .should('have.class', 'active');
        })

        cy.contains('[data-cy=formation]', form2).within(() => {
            cy.get(formationGraph).should('not.have.class', 'active')
                .click()
                .should('have.class', 'active');
        })
    });
});
