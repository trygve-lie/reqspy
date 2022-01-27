'use strict';

const { Writable } = require('stream');
const https = require('https');
const Spy = require("..");

const spy = new Spy();
spy.enable();

spy.on('host', (info) => {
    console.log('new host requested', info);
})

const to = new Writable({
    objectMode: true,
    write(chunk, encoding, callback) {
        console.log(chunk);
        callback();
    }
})

spy.metrics.pipe(to);

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
