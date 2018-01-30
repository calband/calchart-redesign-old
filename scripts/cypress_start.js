const { spawn } = require('child_process');
const fs = require('fs');
const net = require('net');
const path = require('path');
const waitOn = require('wait-on');

const IS_CI = !!process.env.CIRCLECI;
const IS_LOCAL = !IS_CI;

const serverOpts = [
    'calchart/manage.py',
    'testserver',
    'e2e_user.json',
    '--addrport', '5001',
    '--noinput',
];

const waitOpts = {
    resources: ['tcp:5001'],
    delay: 5000,
    timeout: 30000,
};

let djangoProcess = null;
let logDir = path.resolve(__dirname, '../cypress/logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}
let djangoLog = fs.createWriteStream(path.join(logDir, 'cypress_django.log'));

function killServer() {
    if (djangoProcess && djangoProcess.exitCode === null) {
        // http://azimi.me/2014/12/31/kill-child_process-node-js.html
        process.kill(-djangoProcess.pid);
    }
}

function runCypress(arg) {
    let cypress = spawn('cypress', [arg]);
    cypress.stdout.pipe(process.stdout);
    cypress.stderr.pipe(process.stderr);
    cypress.on('close', code => {
        killServer();
        process.exit(code);
    });
}

function runTests(arg) {
    djangoProcess = spawn('python', serverOpts, {
        detached: true,
    });

    djangoProcess.stdout.pipe(djangoLog);
    djangoProcess.stderr.pipe(djangoLog);

    waitOn(waitOpts, err => {
        try {
            if (err) {
                throw err;
            }
            runCypress(arg);
        } catch (e) {
            killServer();
            throw e;
        }
    });
}

module.exports = arg => {
    if (IS_LOCAL) {
        let socket = net.connect(4200)
            .on('connect', () => {
                socket.end();
                runTests(arg);
            })
            .on('error', () => {
                socket.destroy();
                throw new Error('No webpack-dev-server is running');
            });
    } else {
        runTests(arg);
    }
};
