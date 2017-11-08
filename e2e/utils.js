import { Role } from 'testcafe';

const LOGIN_URL = 'http://localhost:5000/login/';

export const adminRole = Role(LOGIN_URL, async t => {
    await t
        .typeText('.field.username input', 'member')
        .typeText('.field.password input', 'calbandgreat')
        .click('.buttons button');
});
