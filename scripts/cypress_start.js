const { execSync, spawn } = require('child_process');
const net = require('net');

const IS_CI = !!process.env.CIRCLECI;
const IS_LOCAL = !IS_CI;

const serverOpts = [
    'calchart/manage.py',
    'testserver',
    'e2e_user.json',
    '--addrport',
    '5001',
    '--noinput',
];

const waitOpts = {
    resources: ['http://localhost:5001/'],
    delay: 5000,
    timeout: 30000,
};

function runTests(arg) {
    let server = null;
    
    try {
        server = spawn('python', serverOpts, {
            stdio: 'ignore',
            // http://azimi.me/2014/12/31/kill-child_process-node-js.html
            detached: true,
        });

        execSync('wait-on', ['http://localhost:5001/']);

        let cypress = spawn('cypress', [arg]);
        cypress.stdout.pipe(process.stdout);
        cypress.stderr.pipe(process.stderr);
        cypress.on('close', code => {
            process.kill(-server.pid);
            process.exit(code);
        });
    } catch (e) {
        if (server) {
            process.kill(-server.pid);
        }
        throw e;
    }
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
