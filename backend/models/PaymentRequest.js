
const mongoose = require("mongoose");

const paymentRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

amount: {
  type: Number,
  required: true,
  min: 1
},

    method: {
      type: String,
      enum: ["UPI_QR", "RAZORPAY"],
      required: true
    },

    transactionId: {
      type: String,
      trim: true,
      default: null
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING"
    },

    verifiedBy: {
      type: String,
      default: null
    },

    verifiedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "PaymentRequest",
  paymentRequestSchema
);
