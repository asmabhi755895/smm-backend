
const mongoose = require("mongoose");

const platformSettingsSchema = new mongoose.Schema(
  {
    platformName: {
      type: String,
      default: "SocialBoost",
      trim: true,
    },
    supportEmail: {
      type: String,
      default: "",
      trim: true,
    },
    ordersEnabled: {
      type: Boolean,
      default: true,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "PlatformSettings",
  platformSettingsSchema
);
