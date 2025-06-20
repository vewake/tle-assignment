import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { SubmissionHeatmap } from "@/components/submission-heatmap"
import { Target, BarChart3, TrendingUp, Calendar } from "lucide-react"

interface Problem {
  contestId: number
  index: string
  name: string
  type: string
  rating?: number
  tags: string[]
}

interface Author {
  contestId: number
  participantId: number
  members: { handle: string }[]
  participantType: string
  ghost: boolean
  startTimeSeconds: number
}

interface ApiSubmissionData {
  id: number
  contestId: number
  creationTimeSeconds: number
  relativeTimeSeconds: number
  problem: Problem
  author: Author
  programmingLanguage: string
  verdict: string
  testset: string
  passedTestCount: number
  timeConsumedMillis: number
  memoryConsumedBytes: number
}

interface ProblemStats {
  mostDifficultRating: number
  totalSolved: number
  averageRating: number
  averagePerDay: number
  ratingDistribution: { rating: string; count: number }[]
}

interface ProblemSolvingDataProps {
  studentId: string
  filterDays: number
  submissionData: ApiSubmissionData[]
}

export function ProblemSolvingData({ studentId, filterDays, submissionData }: ProblemSolvingDataProps) {
  const [stats, setStats] = useState<ProblemStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    calculateProblemStats()
  }, [studentId, filterDays, submissionData])

  const calculateProblemStats = async () => {
    try {
      setLoading(true)

      if (!Array.isArray(submissionData) || submissionData.length === 0) {
        setStats({
          mostDifficultRating: 0,
          totalSolved: 0,
          averageRating: 0,
          averagePerDay: 0,
          ratingDistribution: [],
        })
        return
      }

      // Filter submissions by date range
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - filterDays)
      const cutoffTimestamp = Math.floor(cutoffDate.getTime() / 1000)

      const filteredSubmissions = submissionData.filter(
        (submission) => submission.creationTimeSeconds >= cutoffTimestamp
      )

      // Get only accepted submissions and unique problems
      const acceptedSubmissions = filteredSubmissions.filter(
        (submission) => submission.verdict === "OK"
      )

      // Get unique solved problems (based on contestId + index)
      const uniqueProblems = new Map<string, ApiSubmissionData>()
      acceptedSubmissions.forEach((submission) => {
        const problemKey = `${submission.problem.contestId}-${submission.problem.index}`
        if (!uniqueProblems.has(problemKey)) {
          uniqueProblems.set(problemKey, submission)
        }
      })

      const solvedProblems = Array.from(uniqueProblems.values())

      // Calculate statistics
      const problemsWithRating = solvedProblems.filter(
        (submission) => submission.problem.rating && submission.problem.rating > 0
      )

      const mostDifficultRating = problemsWithRating.length > 0
        ? Math.max(...problemsWithRating.map((s) => s.problem.rating!))
        : 0

      const totalSolved = solvedProblems.length

      const averageRating = problemsWithRating.length > 0
        ? Math.round(
          problemsWithRating.reduce((sum, s) => sum + s.problem.rating!, 0) / problemsWithRating.length
        )
        : 0

      const averagePerDay = filterDays > 0 ? parseFloat((totalSolved / filterDays).toFixed(1)) : 0

      // Calculate rating distribution
      const ratingRanges = [
        { min: 800, max: 999, label: "800-999" },
        { min: 1000, max: 1199, label: "1000-1199" },
        { min: 1200, max: 1399, label: "1200-1399" },
        { min: 1400, max: 1599, label: "1400-1599" },
        { min: 1600, max: 1799, label: "1600-1799" },
        { min: 1800, max: 1999, label: "1800-1999" },
        { min: 2000, max: 2199, label: "2000-2199" },
        { min: 2200, max: 2399, label: "2200-2399" },
        { min: 2400, max: 2599, label: "2400-2599" },
        { min: 2600, max: 3999, label: "2600+" },
      ]

      const ratingDistribution = ratingRanges.map((range) => ({
        rating: range.label,
        count: problemsWithRating.filter(
          (s) => s.problem.rating! >= range.min && s.problem.rating! <= range.max
        ).length,
      })).filter((item) => item.count > 0) // Only show ranges with problems

      const calculatedStats: ProblemStats = {
        mostDifficultRating,
        totalSolved,
        averageRating,
        averagePerDay,
        ratingDistribution,
      }

      setStats(calculatedStats)
    } catch (error) {
      console.error("Failed to calculate problem stats:", error)
      setStats(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!stats) {
    return <div className="text-center py-8 text-muted-foreground">Failed to load problem solving data.</div>
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Most Difficult
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats.mostDifficultRating > 0 ? stats.mostDifficultRating : "N/A"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Total Solved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.totalSolved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Average Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {stats.averageRating > 0 ? stats.averageRating : "N/A"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Per Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-500">{stats.averagePerDay}</div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution Chart */}
      {stats.ratingDistribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Problems by Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.ratingDistribution}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="rating" className="text-muted-foreground" fontSize={12} />
                  <YAxis className="text-muted-foreground" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submission Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Submission Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SubmissionHeatmap studentId={studentId} filterDays={filterDays} submissionData={submissionData} />
        </CardContent>
      </Card>
    </div >
  )
}
