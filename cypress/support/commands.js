Cypress.Commands.add('loginRoot', () => {
    Cypress.log({
        name: 'LOGIN_ROOT',
        message: 'Login as root',
    });

    cy.request('/login/')
        .its('body')
        .then(body => {
            let csrf = Cypress.$(body).find('[name=csrfmiddlewaretoken]').val();
            cy.request({
                method: 'POST',
                url: '/login/',
                form: true,
                body: {
                    username: 'member',
                    password: 'calbandgreat',
                    csrfmiddlewaretoken: csrf,
                },
            });
        });
});
