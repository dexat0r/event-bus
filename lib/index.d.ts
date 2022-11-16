declare module EventBus {
    class Message {
        onResponse(): any | Promise<any>;
    }

    export class EventBus {
        pub<T>(queue: string, meta: T): void;
        sub<T>(queue: string, callback: (meta: T) => any): void;
        once<T>(queue: string, callback: (meta: T) => any): void;
        unsubcribe<T>(queue: string, callback: ((meta: T) => any)[]): void;
        safeSub<T>(queue: string, callback: (meta: T, msg: Message) => any): void;
        safePub<T>(queue: string, meta: T): Message
    }
}