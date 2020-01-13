'use strict';

const { test } = require('tap');
const Spy = require('../');

test('test', (t) => {
    const spy = new Spy();
    spy.enable();

    t.true(true);
    t.end();
});