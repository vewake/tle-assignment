import { fetchCodeforcesData } from "./fetchCfdata.js";
import { Student } from "../models/studentSchema.js";

const updateStudentData = async (student: any) => {
  try {
    const cfData = await fetchCodeforcesData(student.codeforcesHandle)

    student.currentRating = cfData.user.rating || 0
    student.maxRating = cfData.user.maxRating || cfData.user.rating || 0

    student.codeforcesData = {
      contests: cfData.contests,
      submissions: cfData.submissions,
      lastSyncTime: new Date(),
    }

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const recentSubmissions = cfData.submissions.filter((sub: any) => sub.creationTimeSeconds * 1000 > sevenDaysAgo)
    student.isActive = recentSubmissions.length > 0

    student.lastUpdated = new Date()
    await student.save()

    //TODO: remove the logs
    console.log(`Updated data for ${student.name} (${student.codeforcesHandle})`)
    return student
  } catch (error: any) {
    console.error(`Failed to update ${student.name}:`, error.message)
    throw error
  }
}

const syncAllStudentData = async () => {
  try {
    const students = await Student.find()
    console.log(` Syncing data for ${students.length} students...`)

    for (const student of students) {
      try {
        await updateStudentData(student)

        if (!student.isActive && student.emailRemindersEnabled) {
          //TODO: Implement email sending logic
        }

        // Add delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000))
      } catch (error: any) {
        console.error(` Failed to sync ${student.name}:`, error.message)
      }
    }

    console.log("Data sync completed")
  } catch (error) {
    console.error("Sync process failed:", error)
  }
}



export async function sync(req: any, res: any) {
  try {
    await syncAllStudentData()
    res.json({ message: "Sync completed successfully" })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

