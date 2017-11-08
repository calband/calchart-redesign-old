const createTestCafe = require('testcafe');
const glob = require('glob');
const exec = require('child_process').exec;

var testcafe = null;
var failed = false;

var startApp = `manage.py testserver fixtures/e2e_user.json --noinput`;
var isVagrant = false;
if (process.env.CIRCLECI) {
    startApp = `python3 ${startApp}`;
} else if (process.env.USER === 'vagrant') {
    startApp = `python ${startApp}`;
} else {
    startApp = `vagrant ssh -c "python ${startApp}"`;
    isVagrant = true;
}

createTestCafe('localhost', 5000)
    .then(tc => {
        testcafe = tc;

        return testcafe.createRunner()
            .src(glob.sync('e2e/**/*.test.js'))
            .browsers(['chrome:headless', 'firefox:headless'])
            .startApp(startApp, 5000)
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
        // need to kill the manage.py process inside VM
        if (isVagrant) {
            exec('vagrant ssh -c "pkill -9 -f testserver"', {
                timeout: 5000,
            });
        }
        if (failed) {
            process.exit(1);
        }
    });
