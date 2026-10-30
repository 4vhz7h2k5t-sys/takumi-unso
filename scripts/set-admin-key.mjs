// Reads a local ignored secret and sends it on stdin; never logs the value.
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const key=readFileSync('.dev.vars','utf8').match(/^ADMIN_KEY=(.+)$/m)?.[1];
if(!key||key.length<32)throw new Error('A sufficiently long ADMIN_KEY is required in .dev.vars');
const result=spawnSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','secret','put','ADMIN_KEY'],{input:key+'\n',stdio:['pipe','inherit','inherit']});
process.exit(result.status??1);
