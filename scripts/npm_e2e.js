const createTestCafe = require('testcafe');
const glob = require('glob');
const child_process = require('child_process');

// where is npm run e2e running?
const IS_CI = !! process.env.CIRCLECI;
const IS_LOCAL = !IS_CI;

var startApp = [
    'python',
    'calchart/manage.py',
    'testserver',
    'e2e_user.json',
    '--noinput',
].join(' ');

// check that webpack-dev-server is running
if (IS_LOCAL) {
    try {
        child_process.execSync(`lsof -i :4200`);
    } catch (e) {
        throw new Error(`No webpack-dev-server running`);
    }
}

var testcafe = null;
var failed = false;

createTestCafe('localhost', 5000)
    .then(tc => {
        testcafe = tc;

        return testcafe.createRunner()
            .src(glob.sync('e2e/**/*.test.js'))
            .browsers(['chrome:headless', 'firefox:headless'])
            .startApp(startApp)
            .run();
    })
    .then(failed => {
        if (failed === 0) {
            console.log('Tests successfully passed');
        } else {
            console.error(`${failed} test(s) failed`);
            failed = true;
        }
    })
    .catch(e => {
        console.error(e);
        failed = true;
    })
    .finally(() => {
        testcafe.close();
        if (failed) {
            process.exit(1);
        }
    });
