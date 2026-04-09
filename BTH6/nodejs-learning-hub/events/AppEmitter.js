const EventEmitter = require('events');

class AppEmitter extends EventEmitter {
    constructor() {
        super();
        this.counter = 0;

        // Demonstrate 'once'
        this.once('first-event', () => {
            console.log('[EVENT] first-event triggered! This will only be logged once.');
        });
        
        // Demonstrate 'on' with data and callback
        this.on('app-activity', (data, callback) => {
            this.counter++;
            console.log(`[EVENT LOG] App Activity (${this.counter}): ${data.action} at ${new Date().toISOString()}`);
            if (callback) {
                callback(`Activity recorded. Total: ${this.counter}`);
            }
        });
    }

    triggerActivity(actionName, callback) {
        this.emit('app-activity', { action: actionName }, callback);
    }
}

module.exports = AppEmitter;
