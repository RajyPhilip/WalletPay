const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    transactionType: {
        type: String,
        enum: ['send', 'receive'],
        required: true
    },
    transactionDate: {
        type: Date,
        default: Date.now
    },
    transactionCharges: {
        type: Number,
        required: true
    },
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
