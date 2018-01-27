describe('Home page', () => {
    beforeEach(() => {
        cy.loginRoot();
    });

    it('loads', () => {
        cy.visit('/');
        cy.get('body').should('exist');
    });
});
