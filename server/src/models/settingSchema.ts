import mongoose from "mongoose"

const settingsSchema = new mongoose.Schema(
  {
    cronTime: { type: String, default: "02:00" },
    cronFrequency: { type: String, default: "daily" },
    emailEnabled: { type: Boolean, default: true },
    inactivityDays: { type: Number, default: 7 },
    smtpConfig: {
      host: String,
      port: { type: Number, default: 587 },
      user: String,
      password: String,
    },
  },
  {
    timestamps: true,
  },
)

export const Settings = mongoose.model("Settings", settingsSchema)


