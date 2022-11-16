const Bus = require('js-event-bus');
const Message = require('./message');

class EventBus {
    bus;

    constructor() {
        this.bus = new Bus()
    }

    pub(queue, meta) {
        this.bus.emit(queue, null, meta);
    }

    sub(queue, cb) {
        this.bus.on(queue, cb);
    }

    once(queue, cb) {
        this.bus.once(queue, cb)
    }

    unsubscribe(queue, cbArray) {
        if (cbArray == undefined) {
            return this.bus.detachAll(queue);
        }

        if (!Array.isArray(cbArray)) {
            cbArray = [cbArray];
        }

        cbArray.forEach(cb => {
            this.bus.detach(queue, cb)
        });

    }

    safeSub(queue, cb) {
        
    }

    safePub(queue, meta) {
        const msg = new Message();
        this.bus.emit(queue, meta);
        return msg;
    }
}

module.exports = EventBus;