import mongoose from "mongoose"

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    codeforcesHandle: { type: String, required: true, unique: true },
    currentRating: { type: Number, default: 0 },
    maxRating: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
    emailRemindersEnabled: { type: Boolean, default: true },
    reminderCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    codeforcesData: {
      contests: [
        {
          contestId: { type: Number },
          contestName: { type: String },
          handle: { type: String },
          rank: { type: Number },
          ratingUpdateTimeSeconds: { type: Number },
          oldRating: { type: Number },
          newRating: { type: Number },
        },
      ],
      submissions: [
        {
          id: { type: Number },
          contestId: { type: Number },
          creationTimeSeconds: { type: Number },
          relativeTimeSeconds: { type: Number },
          problem: {
            contestId: { type: Number },
            index: { type: String },
            name: { type: String },
            type: { type: String },
            rating: { type: Number },
            tags: [{ type: String }],
          },
          author: {
            contestId: { type: Number },
            members: [
              {
                handle: { type: String },
              },
            ],
            participantType: { type: String },
            ghost: { type: Boolean },
            startTimeSeconds: { type: Number },
          },
          programmingLanguage: { type: String },
          verdict: { type: String },
          testset: { type: String },
          passedTestCount: { type: Number },
          timeConsumedMillis: { type: Number },
          memoryConsumedBytes: { type: Number },
        },
      ],
      lastSyncTime: { type: Date, default: Date.now },
    },
  },
  {
    timestamps: true,
  },
)

export const Student = mongoose.model("Student", studentSchema)
