'use strict';

const EventEmitter = require('events');
const asyncHooks = require('async_hooks');

const hook = Symbol('_hook');

const ReqSpy = class ReqSpy extends EventEmitter {
    constructor({
        hostname = ''
    } = {}) {
        super();

        Object.defineProperty(this, 'hostname', {
            value: hostname,
        });

        Object.defineProperty(this, 'registry', {
            value: new Map(),
        });

        Object.defineProperty(this, 'hook', {
            value: asyncHooks.createHook({
                init: this[hook].bind(this),
            }),
        });
    }

    get [Symbol.toStringTag]() {
        return 'ReqSpy';
    }

    [hook](asyncId, type, triggerAsyncId, resource) {
        if (type !== 'TCPWRAP') {
            return;
        }

        process.nextTick(() => {
            resource.owner.once('lookup', (error, address, family, hostname) => {
                if (this.registry.has(hostname)) {
                    return;
                }

                const obj = {
                    hostname,
                    address: address || null,
                    family: family || null,
                    error: (!!error),
                };

                this.registry.set(hostname, obj);
                this.emit('host', obj);
            });
        });
    }

    enable() {
        this.hook.enable();
    }

    disable() {
        this.hook.disable();
    }

    clear() {
        this.registry.clear();
    }

    values() {
        return Array.from(this.registry.values());
    }

    toJSON() {
        return {
            hostname: this.hostname,
            hosts: this.values(),
        };
    }
};

module.exports = ReqSpy;
