#!/usr/bin/env nodejs

const Path          = require('path');
const ChildProcess  = require('child_process');
const TSConfig      = require('../test/unit/tsconfig.json');

let result = ChildProcess.spawnSync(Path.resolve('./node_modules/.bin/mocha'), [
    '-r', 'ts-node/register',
    //'-r', 'source-map-support/register',
    'test/unit/test.ts'
],
{
    env: {
        ...process.env,
        'PATH':                     './node_modules/.bin;' + process.env.PATH,
        'ARTIFACTS_DIR':            './artifacts/unit/',
        'TS_NODE_FILES':            true,
        'TS_NODE_COMPILER_OPTIONS': JSON.stringify(TSConfig['ts-node'])
    },
    stdio: 'inherit'
});

process.exit(result.status);
