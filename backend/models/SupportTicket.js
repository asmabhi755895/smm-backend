
const mongoose = require("mongoose");

const supportTicketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },

    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved"],
      default: "Open"
    },

    replies: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true
        },

        senderRole: {
          type: String,
          enum: ["user", "admin"],
          required: true
        },

        message: {
          type: String,
          required: true,
          trim: true,
          maxlength: 2000
        },

        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("SupportTicket", supportTicketSchema);