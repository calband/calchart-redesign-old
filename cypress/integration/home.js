describe('Home page', () => {
    it('loads', () => {
        cy.visit('/');
        cy.get('body').should('exist');
    });
});
