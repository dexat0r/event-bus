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

    // console.log(`Subscribing for event with callback`);

    const callBack = (meta) => {
        console.log("Received data: ", meta);
    };

    bus.sub(resource, topic, callBack);

    // console.log(`\nPublishing some data with a little while`);

    await new Promise((resolve) => {
        setTimeout(() => {
            bus.pub(resource, topic, { testValue: 1 });
        }, 1000);

        setTimeout(() => {
            bus.pub(resource, topic, { testValue: 2 });
        }, 1500);

        setTimeout(() => {
            bus.pub(resource, topic, { testValue: 3 });
            resolve();
        }, 2000);
    });

    // console.log(`\nUnsubscribing from event`);
    bus.unsubscribe(resource, topic, callBack);

    bus.pub(resource, topic, { testValue: 4 }); //will not receive

    // console.log(`\nMultiple subscribers`);

    const cb1 = (meta) => {
        console.log("Received data to sub 1: ", meta);
    };
    const cb2 = (meta) => {
        console.log("Received data to sub 2: ", meta);
    };
    const cb3 = (meta) => {
        console.log("Received data to sub 3: ", meta);
    };

    bus.sub(resource, topic, cb1);
    bus.sub(resource, topic, cb2);
    bus.sub(resource, topic, cb3);

    await new Promise((resolve) => {
        setTimeout(() => {
            bus.pub(resource, topic, "Test data for everyone");
            resolve();
        }, 1000);
    });

    // console.log(`Unsubscribing all listeners`);
    bus.unsubscribe(resource, topic, [cb1, cb2, cb3]);

    bus.pub(resource, topic, "Test data which nobody will receive"); //will not receive
}

main().catch(console.log);
