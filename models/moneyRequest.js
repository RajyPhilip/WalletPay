const mongoose = require('mongoose');

const moneyRequestSchema = new mongoose.Schema({
    requester: {
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
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined'],
        default: 'pending'
    },
    charges: {
        type: Number,
        required: true
    },
    superUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        
    }
}, {
    timestamps: true
});

const MoneyRequest = mongoose.model('MoneyRequest', moneyRequestSchema);

module.exports = MoneyRequest;
