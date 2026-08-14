'use strict';

const EventEmitter = require('events');
const asyncHooks = require('async_hooks');
const Metrics = require('@metrics/client');
const is = require('@metrics/metric/lib/is');

const hook = Symbol('_hook');
const lookup = Symbol('_lookup');
const destroy = Symbol('_destroy');

const ReqSpy = class ReqSpy extends EventEmitter {
    constructor({
        metricName = 'requests_outgoing',
        hostname,
        enable = true,
    } = {}) {
        super();

        // Required arguments
        if (!hostname) throw new Error('The argument "hostname" must be provided');

        // Validation
        if (!is.validLabelValue(hostname)) throw new Error('Provided value to argument "hostname" is not legal');
        if (!is.validName(metricName)) throw new Error('Provided value to argument "metricName" is not legal');


        Object.defineProperty(this, 'metrics', {
            value: new Metrics(),
        });

        // Sockets are held weakly so that the spy never keeps one alive, and
        // are keyed by async id so that the "destroy" hook can drop them again
        // as they close.
        Object.defineProperty(this, '_sockets', {
            value: new Map(),
        });

        // One shared listener for all sockets: "removeListener" needs a
        // reference to match on and every socket is handled the same way.
        Object.defineProperty(this, '_lookup', {
            value: this[lookup].bind(this),
        });

        Object.defineProperty(this, '_hook', {
            value: asyncHooks.createHook({
                init: this[hook].bind(this),
                destroy: this[destroy].bind(this),
            }),
        });

        Object.defineProperty(this, '_enabled', {
            value: false,
            writable: true,
        });

        if (enable) {
            this.enable();
        }

        const counter = this.metrics.counter({
            description: 'Outgoing requests to downstream HTTP(S) services',
            name: metricName,
            labels: {
                service: hostname,
            },
        });

        this.on('host', info => {
            counter.inc({
                labels: info
            });
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
            // The socket is attached to on the next tick, by which time the spy
            // may have been disabled.
            if (!this._enabled) {
                return;
            }

            if (!resource.owner) {
                return;
            }

            if (typeof resource.owner.once !== 'function') {
                return;
            }

            resource.owner.once('lookup', this._lookup);

            this._sockets.set(asyncId, new WeakRef(resource.owner));
        });
    }

    [lookup](error, address, family, hostname) {
        this.emit('host', {
            hostname,
            address: address || null,
            family: family || null,
            error: (!!error),
        });
    }

    [destroy](asyncId) {
        this._sockets.delete(asyncId);
    }

    enable() {
        this._enabled = true;
        this._hook.enable();
    }

    disable() {
        this._enabled = false;
        this._hook.disable();

        this._sockets.forEach(ref => {
            const socket = ref.deref();
            if (socket) {
                socket.removeListener('lookup', this._lookup);
            }
        });

        this._sockets.clear();
    }
};

module.exports = ReqSpy;
