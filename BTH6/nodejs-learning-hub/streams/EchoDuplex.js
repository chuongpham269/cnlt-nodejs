const { Duplex } = require('stream');

class EchoDuplex extends Duplex {
    constructor(options) {
        super(options);
    }

    _write(chunk, encoding, callback) {
        // When data is written in, we immediately push it back to the readable side (echo)
        const text = chunk.toString();
        this.push(Buffer.from(`[ECHO-DUPLEX] ${text}`));
        callback();
    }

    _read(size) {
        // We do not need to do anything here because we push synchronously in _write
    }
}

module.exports = EchoDuplex;
