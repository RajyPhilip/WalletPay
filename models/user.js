const mongoose = require('mongoose');
const { boolean } = require('webidl-conversions');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    isPremium: {
        type: Boolean,
        default: false
    },
    balance: {
        type: Number,
        default: 1000
    },
    transactions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
    }],
    role: {
        type: String,
        enum: ['admin', 'regular'],
        default: 'regular'
    },
    moneyRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MoneyRequest'
    }]
},{
    timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;