#!/usr/bin/env node
const readline = require('readline');
const {createLogger} = require('./logFactory.js');
const { hideBin } = require('yargs/helpers');
const yargs = require('yargs/yargs')(hideBin(process.argv));
const logger = createLogger('PingScanner');
const rl = readline.createInterface({
        input:    process.stdin,
        output:   process.stdout,
        terminal: false
    }),
    avg = {
        avg:   0,
        count: 0
    };

const argv = yargs
    .alias('m', 'min-filter')
    .default('min-filter', 20)
    .coerce('m', parseFloat).argv;

logger.debug('min-filter', argv.minFilter);

rl.on('line', (line) => {
    let l = parsePing(line);
    if(!isNaN(l.time)) {
        avg.avg += l.time;
        avg.count++;
        if(l.time >= argv.minFilter) logger.log(line);
    }
});

function parsePing(str) {
    let rtn = {packetSize: '', ip: '', time: NaN};

    str = str.split(':');
    if(str.length < 2) return rtn;

    str[0] = str[0].split(' ');
    if(str[0].length < 4) return rtn;

    str[1] = str[1].split(' ').map(s=>s.split('=')).reduce((a, s)=>{a[s[0]]=s[1]; return a;}, {});
    str[1]['time'] = parseFloat(str[1]['time']);

    return {
        packetSize: str[0][0],
        ip:         str[2],
        ...str[1]
    };
}

rl.once('close', () => {});

setInterval(()=>{
    logger.info('###### AVERAGE ########', avg.avg/avg.count);
}, 10000);
