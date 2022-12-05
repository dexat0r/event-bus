const Bus = require("js-event-bus");
const LRU = require("lru-cache");
const uuid = require("uuid").v4;

const dummyLogger = {
    debug: () => {},
    warn: () => {},
    error: () => {},
};

class EventBus {
    _bus;
    _log;
    _msgCache;
    _queueCache;

    constructor(options) {
        this._bus = new Bus();
        this._log = options?.logger ? options.logger : dummyLogger;
        const cacheOptions = {
            ttl: options?.ttl || 60000,
            max: options?.max || 300,
        };

        this._msgCache = new LRU(cacheOptions);
        this._queueCache = new LRU(cacheOptions);
    }

    /**
     * Publish data with specific resource and topic
     * @param {string} resource Resource
     * @param {string} topic Topic
     * @param {any} meta Data to provide to event
     */
    pub(resource, topic, meta) {
        this._bus.emit(`${resource}.${topic}`, null, meta);
        this._log.debug(`Published ${meta} data on ${resource}.${topic}`);
    }

    /**
     * Subscribe to data publishers with specific resource and topic
     * @param {string} resource Resource
     * @param {string} topic Topic
     * @param {Function} handler Callback which will be use after each event emittion
     */
    sub(resource, topic, handler) {
        this._bus.on(`${resource}.${topic}`, handler);
        this._log.debug(`Subscribed on ${resource}.${topic} event`);
    }

    /**
     * Subscribe once to data publishers with specific resource and topic
     * @param {string} resource Resource
     * @param {string} topic Topic
     * @param {Function} handler Callback which will be use after first event emittion
     */
    once(resource, topic, handler) {
        this._bus.once(`${resource}.${topic}`, handler);
        this._log.debug(
            `Subscribed once on ${resource}.${topic} event with ${handler.toString()} handler`
        );
    }

    /**
     * Unsubscribe from resource.topic
     * @param {string} resource resource
     * @param {string} topic topic
     * @param {Function | Function[] | undefined} handlerArray handlers to remove. If undefined removes all handlers
     */
    unsubscribe(resource, topic, handlerArray) {
        if (handlerArray == undefined) {
            return this._bus.detachAll(queue);
        }

        if (!Array.isArray(handlerArray)) {
            handlerArray = [handlerArray];
        }

        handlerArray.forEach((handler) => {
            this._bus.detach(`${resource}.${topic}`, handler);
        });
        this._log.debug(
            `Deattached ${handlerArray.length} callback(s) from ${resource}.REQUEST.${topic}`
        );
    }

    /**
     * Safe subscribe to data publishers with specific resource and topic with response
     * @param {string} resource resource
     * @param {string} topic topic
     * @param {Function} handler Callback to run after data recieved
     */
    safeSub(resource, topic, handler) {
        this._bus.on(
            `${resource}.REQUEST.${topic}`,
            this.#createCallback(resource, topic, handler)
        );
        this._log.debug(
            `Safe subscribed on ${resource}.REQUEST.${topic} event with ${handler.toString()} handler`
        );
    }

    /**
     * Safe publish data to specific resource and topic and wait for response from subscribers
     * @param {string} resource resource
     * @param {string} topic topic
     * @param {any} meta data to publish
     * @returns {Promise<unknown>} Response
     */
    safePub(resource, topic, meta) {
        this._log.debug(
            `Checking if subscribtion on ${resource}.RESPONSE.${topic} already exists`
        );
        if (!this._queueCache.has(`${resource}.RESPONSE.${topic}`)) {
            this._queueCache.set(`${resource}.RESPONSE.${topic}`, true);
            this._log.debug(
                `Created subscribtion on ${resource}.RESPONSE.${topic}`
            );
            this._bus.on(
                `${resource}.RESPONSE.${topic}`,
                (id, result, error) => {
                    this._log.debug(`Received response for message ${id}`);
                    if (!this._msgCache.has(id)) {
                        this._log.warn(`Message with UUID ${id} was not found`);
                        return;
                    }

                    const { resolve, reject } = this._msgCache.get(id);

                    if (!error) {
                        this._log.debug(
                            `Request completed without errors. Result: ${result}`
                        );
                        resolve(result);
                    } else {
                        this._log.debug(
                            `Request completed with error. Error: ${error}`
                        );
                        reject(error);
                    }
                }
            );
        }
        return new Promise((resolve, reject) => {
            const id = uuid();
            this._msgCache.set(id, { resolve, reject });
            this._log.debug(`Sending request to ${resource}.REQUEST.${topic}`);
            this._bus.emit(`${resource}.REQUEST.${topic}`, null, { id, meta });
        });
    }

    /**
     * Unsubscribe from safe resource.topic
     * @param {string} resource resource
     * @param {string} topic topic
     * @param {Function} handler callback to deattach
     */
    safeUnsubscribe(resource, topic, handler) {
        this._bus.detach(
            `${resource}.REQUEST.${topic}`,
            this.#createCallback(handler)
        );
        this._log.debug(
            `Deattached safe callback from ${resource}.REQUEST.${topic}`
        );
    }

    /**
     * Creates special callback from user handler
     * @param {string} resource resource
     * @param {string} topic topic
     * @param {Function} handler handler
     * @returns {Function} Callback
     */
    #createCallback(resource, topic, handler) {
        return async (data) => {
            try {
                this._log.debug(
                    `Received request from ${resource}.REQUEST.${topic} with data ${data}`
                );

                const result = await handler(data.meta);

                this._bus.emit(
                    `${resource}.RESPONSE.${topic}`,
                    null,
                    data.id,
                    result,
                    null
                );
            } catch (error) {
                this._bus.emit(
                    `${resource}.RESPONSE.${topic}`,
                    null,
                    data.id,
                    null,
                    error || "Promise rejected without error string"
                );
            }
        };
    }
}

module.exports = EventBus;
