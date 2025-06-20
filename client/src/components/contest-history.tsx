import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import { TrendingUp, Calendar } from "lucide-react"
import { format, isValid } from "date-fns"
import { getRatingColor } from "./getRatingColor"

// Import your rating color function here
// import { getRatingColor } from "@/utils/rating-colors" // Adjust path as needed

interface Contest {
  id: string
  name: string
  date: Date
  rank: number
  ratingChange: number
  newRating: number
  problemsSolved?: number
  totalProblems?: number
}

interface ApiContestData {
  contestId: number
  contestName: string
  handle: string
  rank: number
  ratingUpdateTimeSeconds: number
  oldRating: number
  newRating: number
  _id: string
}

interface ContestHistoryProps {
  studentId: string
  filterDays: number
  contestData: ApiContestData[]
}

// Placeholder function - replace with your actual getRatingColor function


export function ContestHistory({ studentId, filterDays, contestData }: ContestHistoryProps) {
  const [contests, setContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContestHistory()
  }, [studentId, filterDays, contestData])

  const fetchContestHistory = async () => {
    try {
      setLoading(true)

      // Transform API data to match our Contest interface
      const processedContestData: Contest[] = Array.isArray(contestData)
        ? contestData.map((contest: ApiContestData) => {
          const date = new Date(contest.ratingUpdateTimeSeconds * 1000) // Convert Unix timestamp to Date
          return {
            id: contest._id || contest.contestId.toString(),
            name: contest.contestName,
            date: date,
            rank: contest.rank,
            ratingChange: contest.newRating - contest.oldRating,
            newRating: contest.newRating,
            problemsSolved: undefined, // Not available in API data
            totalProblems: undefined, // Not available in API data
          }
        }).filter((contest: Contest) => isValid(contest.date)) // Filter out invalid dates
        : []

      // Filter by date range
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - filterDays)
      const filteredContests = processedContestData.filter((contest: Contest) => contest.date >= cutoffDate)

      // Sort by date (most recent first)
      filteredContests.sort((a, b) => b.date.getTime() - a.date.getTime())

      setContests(filteredContests)
    } catch (error) {
      console.error("Failed to fetch contest history:", error)
      setContests([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const chartData = contests
    .filter((contest) => isValid(contest.date)) // Additional safety check
    .map((contest) => ({
      date: format(contest.date, "MMM dd"),
      fullDate: format(contest.date, "MMM dd, yyyy"),
      rating: contest.newRating,
      change: contest.ratingChange,
      contestName: contest.name.length > 30 ? contest.name.substring(0, 30) + "..." : contest.name,
      rank: contest.rank,
      ratingColor: getRatingColor(contest.newRating),
    }))
    .reverse() // Reverse for chronological order in chart

  // Calculate rating statistics
  const ratingStats = contests.length > 0 ? {
    current: contests[0]?.newRating || 0,
    highest: Math.max(...contests.map(c => c.newRating)),
    lowest: Math.min(...contests.map(c => c.newRating)),
    totalChange: contests.length > 0 ? contests[0].newRating - (contests[contests.length - 1].newRating - contests[contests.length - 1].ratingChange) : 0
  } : null

  // Get dynamic colors for the chart
  const currentRatingColor = ratingStats ? getRatingColor(ratingStats.current) : "#0ea5e9"
  const peakRatingColor = ratingStats ? getRatingColor(ratingStats.highest) : "#22c55e"

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-4 max-w-xs">
          <p className="font-semibold text-foreground mb-2">{data.fullDate}</p>
          <p className="text-sm text-muted-foreground mb-2 truncate">{data.contestName}</p>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="text-muted-foreground">Rating: </span>
              <span className="font-semibold" style={{ color: data.ratingColor }}>
                {data.rating}
              </span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Change: </span>
              <span className={`font-semibold ${data.change > 0 ? 'text-green-500' : data.change < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                {data.change > 0 ? '+' : ''}{data.change}
              </span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Rank: </span>
              <span className="font-semibold">#{data.rank.toLocaleString()}</span>
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Rating Chart */}
      {contests.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Rating Progress
              </CardTitle>
              {ratingStats && (
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-muted-foreground">Current</p>
                    <p className="font-bold text-lg" style={{ color: currentRatingColor }}>
                      {ratingStats.current}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground">Peak</p>
                    <p className="font-bold" style={{ color: peakRatingColor }}>
                      {ratingStats.highest}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground">Total Δ</p>
                    <p className={`font-bold ${ratingStats.totalChange > 0 ? 'text-green-600' : ratingStats.totalChange < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                      {ratingStats.totalChange > 0 ? '+' : ''}{ratingStats.totalChange}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={currentRatingColor} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={currentRatingColor} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted/30"
                    horizontal={true}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    className="text-muted-foreground"
                    fontSize={12}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    className="text-muted-foreground"
                    fontSize={12}
                    axisLine={false}
                    tickLine={false}
                    width={60}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="rating"
                    stroke={currentRatingColor}
                    strokeWidth={3}
                    fill="url(#ratingGradient)"
                    dot={{
                      fill: currentRatingColor,
                      strokeWidth: 3,
                      r: 5,
                      stroke: "hsl(var(--background))"
                    }}
                    activeDot={{
                      r: 7,
                      stroke: currentRatingColor,
                      strokeWidth: 3,
                      fill: "hsl(var(--background))"
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contest List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Contests ({contests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No contests found in the selected time period.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contest</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-center">Rank</TableHead>
                    <TableHead className="text-center">Rating Δ</TableHead>
                    <TableHead className="text-center">New Rating</TableHead>
                    <TableHead className="text-center">Old Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contests.map((contest) => {
                    const oldRating = contest.newRating - contest.ratingChange
                    const newRatingColor = getRatingColor(contest.newRating)
                    const oldRatingColor = getRatingColor(oldRating)

                    return (
                      <TableRow key={contest.id}>
                        <TableCell className="font-medium max-w-xs">
                          <div className="truncate" title={contest.name}>
                            {contest.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {isValid(contest.date) ? format(contest.date, "MMM dd, yyyy") : "Invalid Date"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">#{contest.rank.toLocaleString()}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`font-semibold ${contest.ratingChange > 0
                              ? "text-green-500"
                              : contest.ratingChange < 0
                                ? "text-red-500"
                                : "text-muted-foreground"
                              }`}
                          >
                            {contest.ratingChange > 0 ? "+" : ""}
                            {contest.ratingChange}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`font-semibold ${newRatingColor}`}
                          >
                            {contest.newRating}

                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`font-medium ${oldRatingColor}`}
                          >
                            {oldRating}
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
