export interface Contest {
  contestId: number
  contestName: string
  handle: string
  rank: number
  ratingUpdateTimeSeconds: number
  oldRating: number
  newRating: number
}

export interface Problem {
  contestId: number
  index: string
  name: string
  type: string
  rating: number
  tags: string[]
}

export interface Submission {
  id: number
  contestId: number
  creationTimeSeconds: number
  relativeTimeSeconds: number
  problem: Problem
  author: {
    contestId: number
    members: {
      handle: string
    }[]
    participantType: string
    ghost: boolean
    startTimeSeconds: number
  }
  programmingLanguage: string
  verdict: string
  testset: string
  passedTestCount: number
  timeConsumedMillis: number
  memoryConsumedBytes: number
}

export interface CodeforcesData {
  contests: Contest[]
  submissions: Submission[]
  lastSyncTime: Date
}

export interface Student {
  _id: string // optional, MongoDB document ID
  id: string // optional, MongoDB document ID
  name: string
  email: string
  phone?: string
  codeforcesHandle: string
  currentRating: number
  maxRating: number
  lastUpdated: Date
  emailRemindersEnabled: boolean
  reminderCount: number
  isActive: boolean
  codeforcesData: CodeforcesData
  createdAt?: Date
  updatedAt?: Date
}

