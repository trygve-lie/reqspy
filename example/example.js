'use strict';

const https = require('https');
const Spy = require('../');

const spy = new Spy();
spy.enable();

spy.on('host', (info) => {
    console.log('new host requested', info);
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
