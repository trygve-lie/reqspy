'use strict';

const { test } = require('tap');
const https = require('https');
const Spy = require('../');

const get = (url) => {
    return new Promise((resolve) => {
        https.get(url, resolve).on('error', resolve);
    });
};

test('Object type', (t) => {
    const spy = new Spy();
    t.equal(Object.prototype.toString.call(spy), '[object ReqSpy]', 'should be ReqSpy');
    t.end();
});

test('The spy is not enabled', async (t) => {
    const spy = new Spy();

    await Promise.all([
        get('https://github.com'),
        get('https://github.com'),
        get('https://google.com'),
    ]);

    t.equal(spy.values().length, 0, 'should not log any hosts');
    t.end();
});

test('The spy is enabled', async (t) => {
    const spy = new Spy();
    spy.enable();

    await Promise.all([
        get('https://github.com'),
        get('https://github.com'),
        get('https://google.com'),
    ]);

    t.equal(spy.values().length, 2, 'should log two hosts');
    t.end();
});

test('The spy is enabled, then disabled', async (t) => {
    const spy = new Spy();
    spy.enable();

    await Promise.all([
        get('https://github.com'),
        get('https://github.com'),
    ]);

    t.equal(spy.values().length, 1, 'should have logged one host');

    spy.disable();
    await get('https://google.com');

    t.equal(spy.values().length, 1, 'should have logged one host');
    t.end();
});

test('The spy is cleared', async (t) => {
    const spy = new Spy();
    spy.enable();

    await Promise.all([
        get('https://github.com'),
        get('https://github.com'),
        get('https://google.com'),
    ]);

    t.equal(spy.values().length, 2, 'should log two hosts');

    spy.clear();

    t.equal(spy.values().length, 0, 'should not have any hosts logged');
    t.end();
});

test('Recorded values on resolved host', async (t) => {
    const spy = new Spy();
    spy.enable();

    await get('https://github.com');

    const hosts = spy.values();

    t.type(hosts[0].hostname, 'string', '".hostname" should be a Sting');
    t.type(hosts[0].address, 'string', '".address" should be a Sting');
    t.type(hosts[0].family, 'number', '".family" should be a Number');
    t.type(hosts[0].error, 'boolean', '".error" should be a Boolean');
    t.false(hosts[0].error, '".error" should be "false"');
    t.end();
});

test('Recorded values on un-resolved host', async (t) => {
    const spy = new Spy();
    spy.enable();

    await get('https://klfsdjngkjdfljs.com');

    const hosts = spy.values();

    t.type(hosts[0].hostname, 'string', '".hostname" should be a Sting');
    t.type(hosts[0].address, 'null', '".address" should be a null');
    t.type(hosts[0].family, 'null', '".family" should be a null');
    t.type(hosts[0].error, 'boolean', '".error" should be a Boolean');
    t.true(hosts[0].error, '".error" should be "true"');
    t.end();
});

test('.toJSON on resolved host', async (t) => {
    const spy = new Spy();
    spy.enable();

    await get('https://github.com');

    const str = JSON.stringify(spy);
    const obj = JSON.parse(str);

    t.type(obj.hosts[0].hostname, 'string', '".hostname" should be a Sting');
    t.type(obj.hosts[0].address, 'string', '".address" should be a Sting');
    t.type(obj.hosts[0].family, 'number', '".family" should be a Number');
    t.type(obj.hosts[0].error, 'boolean', '".error" should be a Boolean');
    t.false(obj.hosts[0].error, '".error" should be "false"');
    t.end();
});

test('.toJSON on un-resolved host', async (t) => {
    const spy = new Spy();
    spy.enable();

    await get('https://klfsdjngkjdfljs.com');

    const str = JSON.stringify(spy);
    const obj = JSON.parse(str);

    t.type(obj.hosts[0].hostname, 'string', '".hostname" should be a Sting');
    t.type(obj.hosts[0].address, 'null', '".address" should be a null');
    t.type(obj.hosts[0].family, 'null', '".family" should be a null');
    t.type(obj.hosts[0].error, 'boolean', '".error" should be a Boolean');
    t.true(obj.hosts[0].error, '".error" should be "true"');
    t.end();
});

test('"host" event on resolved host', async (t) => {
    const spy = new Spy();
    spy.enable();

    spy.once('host', (obj) => {
        t.type(obj.hostname, 'string', '".hostname" should be a Sting');
        t.type(obj.address, 'string', '".address" should be a Sting');
        t.type(obj.family, 'number', '".family" should be a Number');
        t.type(obj.error, 'boolean', '".error" should be a Boolean');
        t.false(obj.error, '".error" should be "false"');
        t.end();
    });

    await get('https://github.com');
});

test('.toJSON on un-resolved host', async (t) => {
    const spy = new Spy();
    spy.enable();

    spy.once('host', (obj) => {
        t.type(obj.hostname, 'string', '".hostname" should be a Sting');
        t.type(obj.address, 'null', '".address" should be a null');
        t.type(obj.family, 'null', '".family" should be a null');
        t.type(obj.error, 'boolean', '".error" should be a Boolean');
        t.true(obj.error, '".error" should be "true"');
        t.end();
    });

    await get('https://klfsdjngkjdfljs.com');
});

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