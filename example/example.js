'use strict';

const https = require('https');
const http = require('http');
const Spy = require('../');

const spy = new Spy();
spy.enable();

spy.on('host', (host, ip, family, err ) => {
    console.log('new host requested', host, ip, family, err);
})

setTimeout(() => {
    https.get('https://www.finn.no', () => {
        // console.log('got stuff');
    }).on('error', () => {});
}, 100);

setTimeout(() => {
    https.get('https://www.finn.no', () => {
        // console.log('got stuff');
    }).on('error', () => {});
}, 200);

setTimeout(() => {
    https.get('https://www.buggabuggahi.no', () => {
        // console.log('got stuff');
    }).on('error', () => {});
}, 300);

setTimeout(() => {
    https.get('https://www.db.no', () => {
        // console.log('got stuff');
    }).on('error', () => {});
}, 400);



http.createServer((req, res) => {
    res.write('ok');
    res.end();
}).listen(8001);
