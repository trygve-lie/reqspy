'use strict';

const EventEmitter = require('events');
const asyncHooks = require('async_hooks');

const hook = Symbol('_hook');

const ReqSpy = class ReqSpy extends EventEmitter {
    constructor() {
        super();

        Object.defineProperty(this, 'registry', {
            value: new Set(),
        });

        Object.defineProperty(this, 'hook', {
            value: asyncHooks.createHook({
                init: this[hook].bind(this),
            }),
        });
    }

    [hook](asyncId, type, triggerAsyncId, resource) {
        if (type === 'HTTPCLIENTREQUEST') {
            console.log(type, asyncId, triggerAsyncId);
        }

        if (type === 'TCPCONNECTWRAP') {
            console.log(type, resource);
        }

        if (type !== 'TCPWRAP') {
            return;
        }

        console.log(type, asyncId, triggerAsyncId);

        process.nextTick(() => {
            resource.owner.once('lookup', (err, address, family, host) => {
                if (!this.registry.has(host)) {
                    this.registry.add(host);
                    this.emit('host', host, address, family, err);
                }
            });
        });
    }

    enable() {
        this.hook.enable();
    }

    disable() {
        this.hook.disable();
    }

    toJSON() {
        return Array.from(this.registry.values());
    }
};

module.exports = ReqSpy;
