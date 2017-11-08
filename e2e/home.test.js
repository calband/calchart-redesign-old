import { adminRole } from './utils';

fixture('Home page')
    .page('http://localhost:5000')
    .beforeEach(async t => t.useRole(adminRole));

test('Loads home page', async t => {
    await t.expect('div.home-view').ok();
});

// TODO: test sendAction('publish')
// TODO: test sendAction('create-show')
