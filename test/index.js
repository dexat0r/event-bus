const bus = require("../lib/index.js");
const chai = require("chai");
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
const pino = require('pino');

chai.use(chaiAsPromised);
chai.should();

describe("Pub-sub unit tests", () => {
    const resource = "TEST";
    const topic = "test";
    this._bus;

    beforeEach(() => {
        this._bus = new bus({
            logger: pino({
                level: 'debug'
            })
        });
        console.log('\n');
    });

    it("Should subscribe on test events and receive data after publish", () => {
        let result = null;
        this._bus.sub(resource, topic, (data) => (result = data));
        this._bus.pub(resource, topic, true);
        expect(result).to.be.equal(true);
    });

    it("safeSub should end safePub correctly", async () => {
        this._bus.safeSub(resource, topic, (data) => data);
        return this._bus
            .safePub(resource, topic, { test: true })
            .then((data) => {
                expect(data.test).to.be.equal(true);
            });
    });

    it("Should reject safePub if handler goes wrong", () => {
        this._bus.safeSub(resource, topic, () => Promise.reject());
        return this._bus.safePub(resource, topic, null).should.be.rejected;
    });
});
