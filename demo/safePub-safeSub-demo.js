const EventBus = require("../lib/index.js");
const pino = require("pino");

async function main() {
    const bus = new EventBus({
        logger: pino({
            level: "debug",
        }),
    });
    const resource = "test";
    const topic = "test-topic";

    const callback = (meta) => meta % 2 == 0 ? meta / 2 : (meta + 1) / 2

    bus.safeSub(resource, topic, callback)

    console.log(await bus.safePub(resource, topic, 2));
    console.log(await bus.safePub(resource, topic, 5));

    bus.safeUnsubscribe(resource, topic, callback) //??
    
    console.log(await bus.safePub(resource, topic, 2));
    console.log(await bus.safePub(resource, topic, 5));
}

main().catch(console.log);