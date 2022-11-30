const Bus = require("js-event-bus");
const _logger = require("pino");

class EventBus {
    _bus;
    _log;

    constructor(logger) {
        this._bus = new Bus();
        this._log = logger ? new logger() : _logger;
    }

    /**
     * Publish data with specific resource and topic
     * @param {string} resource Resource
     * @param {string} topic Topic
     * @param  {...any} args Data to provide to event 
     */
    pub(resource, topic, ...args) {
        this._bus.emit(`${resource}.${topic}`, null, ...args);
    }

    /**
     * Subscribe to data publishers with specific resource and topic
     * @param {string} resource Resource
     * @param {string} topic Topic
     * @param {Function} cb Callback which will be use after each event emittion
     */
    sub(resource, topic, cb) {
        this._bus.on(`${resource}.${topic}`, cb);
    }

    /**
     * Subscribe once to data publishers with specific resource and topic
     * @param {string} resource Resource
     * @param {string} topic Topic
     * @param {Function} cb Callback which will be use after first event emittion
     */
    once(resource, topic, cb) {
        this._bus.once(`${resource}.${topic}`, cb);
    }

    /**
     * 
     * @param {*} resource 
     * @param {*} topic 
     * @param {} cbArray 
     * @returns 
     */
    unsubscribe(resource, topic, cbArray) {
        if (cbArray == undefined) {
            return this._bus.detachAll(queue);
        }

        if (!Array.isArray(cbArray)) {
            cbArray = [cbArray];
        }

        cbArray.forEach((cb) => {
            this._bus.detach(`${resource}.${topic}`, cb);
        });
    }

    /**
     * 
     * @param {*} resource 
     * @param {*} topic 
     * @param {*} handler 
     */
    safeSub(resource, topic, handler) {
        const promisedFunction = this.#promiseFunction(handler)
        this.sub(resource, topic, promisedFunction);
    }

    /**
     * 
     * @param {*} resource 
     * @param {*} topic 
     * @param {*} meta 
     * @returns 
     */
    safePub(resource, topic, meta) {
        return new Promise ((resolve, reject) => {
            this.pub(resource, topic, meta, resolve, reject);
        });
    }

    /**
     * 
     * @param {*} resource 
     * @param {*} topic 
     * @param {*} handler 
     */
    safeUnsubscribe(resource, topic, handler) {
        this._bus.detach(`${resource}.${topic}`, this.#promiseFunction(handler));
    }

    #promiseFunction(_handler) {
        return async (meta, resolve, reject) => {
            try {
                const result = await _handler(meta)
                resolve(result)
            } catch (error) {
                reject(error)
            }
        };
    }
}

module.exports = EventBus;