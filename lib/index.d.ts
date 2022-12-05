export declare interface Options {
    logger?: DummyLogger,
    ttl?: number,
    max?: number,
}

type DummyLogger = {
    debug: (msg: string, ...args: any[]) => void,
    warn: (msg: string, ...args: any[]) => void,
    error: (msg: string, ...args: any[]) => void,
}
declare class EventBus {
    constructor(options: Options);
    /**
     * Publish data with specific resource and topic
     * @param {string} resource Resource
     * @param {string} topic Topic
     * @param  {any} meta Data to provide to event
     */
    public pub<T = any>(resource: string, topic: string, meta: T): void;

    /**
     * Subscribe to data publishers with specific resource and topic
     * @param {string} resource Resource
     * @param {string} topic Topic
     * @param {Function} handler Callback which will be use after each event emittion
     */
    public sub<T = any, K = unknown>(resource: string, topic: string, handler: (meta: T) => K): void;

    /**
     * Subscribe once to data publishers with specific resource and topic
     * @param {string} resource Resource
     * @param {string} topic Topic
     * @param {Function} handler Callback which will be use after first event emittion
     */
    public once<T = any, K = unknown>(resource: string, topic: string, handler: (meta: T) => K): void;

    /**
     * Unsubscribe from resource.topic
     * @param {string} resource resource
     * @param {string} topic topic
     * @param {(Function | Function[] | undefined)} handlerArray handlers to remove. If undefined removes all handlers
     */
    public unsubcribe<T = any, K = unknown>(
        resource: string,
        topic: string,
        handlerArray: ((meta: T) => K)[]
    ): void;

    /**
     * Safe subscribe to data publishers with specific resource and topic with response
     * @param {string} resource resource
     * @param {string} topic topic
     * @param {Function} handler Callback to run after data recieved
     */
    public safeSub<T = any, K = unknown>(
        resource: string,
        topic: string,
        handler: (meta: T) => K
    ): void;
    public safePub<T>(resource: string, topic: string, meta: T): Promise<unknown>;

    /**
     * Safe publish data to specific resource and topic and wait for response from subscribers
     * @param {string} resource resource
     * @param {string} topic topic
     * @param {any} meta data to publish
     * @returns {Promise<unknown>} Response
     */
     safePub<T = any, K = unknown>(resource: string, topic: string, meta: T): Promise<K>
}

export default EventBus;