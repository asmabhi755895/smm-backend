const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    serviceType: { type: String, required: true },
    serviceLabel: { type: String, required: true },
    quantity: { type: Number, required: true },
    link: { type: String, required: true },
    charge: { type: Number, required: true },
    providerOrderId: { type: String, default: 'MOCK_ID' },
    status: { type: String, default: 'Processing', enum: ['Processing', 'Completed', 'Partial', 'Refunded'] },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);