describe('Login page', () => {
    it('can login', () => {
        cy.visit('/login');
        cy.get('#id_username').type('member');
        cy.get('#id_password').type('calbandgreat{enter}');

        cy.url().should('eq', 'http://localhost:5001/');
    });
});
