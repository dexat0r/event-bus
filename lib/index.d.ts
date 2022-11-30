declare module EventBus {
    export class EventBus {
        pub<T>(resource: string, topic: string, meta: T): void;
        sub<T>(resource: string, topic: string, callback: (meta: T) => any): void;
        once<T>(resource: string, topic: string, callback: (meta: T) => any): void;
        unsubcribe<T>(resource: string, topic: string, callback: ((meta: T) => any)[]): void;
        safeSub<T>(resource: string, topic: string, callback: (meta: T) => any): void;
        safePub<T>(resource: string, topic: string, meta: T): Promise<>
    }
}