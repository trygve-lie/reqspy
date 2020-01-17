'use strict';

const { Writable } = require('stream');
const { test } = require('tap');
const https = require('https');
const Spy = require('../');

const get = (url) => {
    return new Promise((resolve) => {
        https.get(url, () => {
            process.nextTick(resolve);
        }).on('error', () => {
            process.nextTick(resolve);
        });
    });
};

const to = (done) => {
    const items = [];
    const writer = new Writable({
        objectMode: true,
        write(chunk, encoding, callback) {
            items.push(chunk);
            callback();
        }
    });
    writer.on('finish', () => {
        done(items);
    });
    return writer;
};

test('Object type', (t) => {
    const spy = new Spy({ hostname: 'turing' });
    t.equal(Object.prototype.toString.call(spy), '[object ReqSpy]', 'should be ReqSpy');
    t.end();
});

test('No arguments', (t) => {
    t.plan(1);
    t.throws(() => {
        const spy = new Spy(); // eslint-disable-line no-unused-vars
    }, /The argument "hostname" must be provided/, 'should throw');
    t.end();
});

test('The argument "metricName" is not legal', (t) => {
    t.plan(1);
    t.throws(() => {
        const spy = new Spy({ hostname: 'turing', metricName: {} }); // eslint-disable-line no-unused-vars
    }, /Provided value to argument "metricName" is not legal/, 'should throw');
    t.end();
});

test('"host" event on resolved host', async (t) => {
    const spy = new Spy({ hostname: 'turing' });
    spy.enable();

    let result = {};

    spy.once('host', (obj) => {
        result = obj;
    });

    await get('https://github.com');

    t.type(result.hostname, 'string', '".hostname" should be a Sting');
    t.type(result.address, 'string', '".address" should be a Sting');
    t.type(result.family, 'number', '".family" should be a Number');
    t.type(result.error, 'boolean', '".error" should be a Boolean');
    t.false(result.error, '".error" should be "false"');
    t.end();
});

test('"host" event on un-resolved host', async (t) => {
    const spy = new Spy({ hostname: 'turing' });
    spy.enable();

    let result = {};

    spy.once('host', (obj) => {
        result = obj;
    });

    await get('https://klfsdjngkjdfljs.com');

    t.type(result.hostname, 'string', '".hostname" should be a Sting');
    t.type(result.address, 'null', '".address" should be a null');
    t.type(result.family, 'null', '".family" should be a null');
    t.type(result.error, 'boolean', '".error" should be a Boolean');
    t.true(result.error, '".error" should be "true"');
    t.end();
});

test('The spy is not enabled', async (t) => {
    const spy = new Spy({ hostname: 'turing' });

    const result = [];

    spy.on('host', (obj) => {
        result.push(obj);
    });

    await Promise.all([
        get('https://github.com'),
        get('https://github.com'),
        get('https://google.com'),
    ]);

    t.equal(result.length, 0, 'should not log any hosts');
    t.end();
});

test('The spy is enabled, then disabled', async (t) => {
    const spy = new Spy({ hostname: 'turing' });
    spy.enable();

    const result = [];

    spy.on('host', (obj) => {
        result.push(obj);
    });

    await Promise.all([
        get('https://github.com'),
        get('https://github.com'),
    ]);

    t.equal(result.length, 2, 'should have logged two hosts');

    spy.disable();
    await get('https://google.com');

    t.equal(result.length, 2, 'should have logged two hosts');
    t.end();
});

test('Recorded values on resolved host', async (t) => {
    const spy = new Spy({ hostname: 'turing' });
    spy.enable();

    const result = [];

    spy.on('host', (obj) => {
        result.push(obj);
    });

    await get('https://github.com');

    t.type(result[0].hostname, 'string', '".hostname" should be a Sting');
    t.type(result[0].address, 'string', '".address" should be a Sting');
    t.type(result[0].family, 'number', '".family" should be a Number');
    t.type(result[0].error, 'boolean', '".error" should be a Boolean');
    t.false(result[0].error, '".error" should be "false"');
    t.end();
});

test('Recorded values on un-resolved host', async (t) => {
    const spy = new Spy({ hostname: 'turing' });
    spy.enable();

    const result = [];

    spy.on('host', (obj) => {
        result.push(obj);
    });

    await get('https://klfsdjngkjdfljs.com');

    t.type(result[0].hostname, 'string', '".hostname" should be a Sting');
    t.type(result[0].address, 'null', '".address" should be a null');
    t.type(result[0].family, 'null', '".family" should be a null');
    t.type(result[0].error, 'boolean', '".error" should be a Boolean');
    t.true(result[0].error, '".error" should be "true"');
    t.end();
});

test('metric stream', async (t) => {
    const spy = new Spy({ hostname: 'turing' });
    spy.enable();

    const dest = to((result) => {
        t.equal(result.length, 3, 'should emit a metric for each host');
        t.end();
    });
    spy.metrics.pipe(dest);

    await Promise.all([
        get('https://github.com'),
        get('https://github.com'),
        get('https://google.com'),
    ]);

    dest.end();
});

test('metric stream values', async (t) => {
    const spy = new Spy({ metricName: 'alan', hostname: 'turing' });
    spy.enable();

    const dest = to((result) => {
        t.equal(result[0].name, 'alan', 'should have same value as "metricName" on constructor');
        t.equal(result[0].labels.length, 5, 'should have labels');
        t.end();
    });
    spy.metrics.pipe(dest);

    await get('https://github.com');

    dest.end();
});


/*
test('Argument "hostname" is not set on constructor', (t) => {
    const spy = new Spy();

    const str = JSON.stringify(spy);
    const obj = JSON.parse(str);

    t.equal(obj.hostname, '', 'should be an empty Sting');
    t.end();
});

test('Argument "hostname" is set on constructor', (t) => {
    const spy = new Spy({ hostname: 'foobar' });

    const str = JSON.stringify(spy);
    const obj = JSON.parse(str);

    t.equal(obj.hostname, 'foobar', 'should be the same as set on the constructor');
    t.end();
});
*/