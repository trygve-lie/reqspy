'use strict';

const EventEmitter = require('events');
const asyncHooks = require('async_hooks');
const Metrics = require('@metrics/client');
const is = require('@metrics/metric/lib/is');

const hook = Symbol('_hook');

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

        Object.defineProperty(this, '_hook', {
            value: asyncHooks.createHook({
                init: this[hook].bind(this),
            }),
        });

        if (enable) {
            this._hook.enable();
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
            if (!resource.owner) {
                return;
            }

            resource.owner.once('lookup', (error, address, family, hostname) => {
                this.emit('host', {
                    hostname,
                    address: address || null,
                    family: family || null,
                    error: (!!error),
                });
            });
        });
    }

    enable() {
        this._hook.enable();
    }

    disable() {
        this._hook.disable();
    }
};

module.exports = ReqSpy;
