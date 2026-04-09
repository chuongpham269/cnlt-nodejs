const { Transform } = require('stream');

class TextTransform extends Transform {
    constructor(options) {
        super(options);
    }

    _transform(chunk, encoding, callback) {
        // Biến đổi text: lowercase all, uppercase first letter, or simply replace spaces
        const original = chunk.toString();
        const transformed = original.toUpperCase().replace(/ /g, '_');
        this.push(Buffer.from(transformed));
        callback();
    }
}

module.exports = TextTransform;
