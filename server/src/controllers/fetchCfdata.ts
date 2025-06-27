import axios from 'axios'
export const fetchCodeforcesData = async (handle: string) => {
  try {

    // Fetch user info
    const userResponse = await axios.get(`https://codeforces.com/api/user.info?handles=${handle}`)
    const userData = userResponse.data.result[0]

    // Fetch contest history
    const contestResponse = await axios.get(`https://codeforces.com/api/user.rating?handle=${handle}`)
    const contestData = contestResponse.data.result

    // Fetch submissions
    const submissionResponse = await axios.get(
      `https://codeforces.com/api/user.status?handle=${handle}&from=1&count=10000`,
    )
    const submissionData = submissionResponse.data.result

    return {
      user: userData,
      contests: contestData,
      submissions: submissionData,
    }
  } catch (error: any) {
    console.error(`Error fetching data for ${handle}:`, error.message)
    throw error
  }
}
