const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: String,
    receiver: String,
    message: String,
    type: { type: String, default: 'text' }, // 'text', 'image', 'file', 'sticker'
    fileUrl: { type: String, default: '' },
    time: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);