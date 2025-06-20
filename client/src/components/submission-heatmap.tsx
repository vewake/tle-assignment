import { useState, useEffect } from "react"
import { format, startOfDay, eachDayOfInterval, subDays, isValid, getDay, startOfWeek, endOfWeek, addWeeks } from "date-fns"

interface ApiSubmissionData {
  id: number
  contestId: number
  creationTimeSeconds: number
  relativeTimeSeconds: number
  problem: {
    contestId: number
    index: string
    name: string
    type: string
    rating?: number
    tags: string[]
  }
  author: {
    contestId: number
    participantId: number
    members: { handle: string }[]
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

interface SubmissionHeatmapProps {
  studentId: string
  filterDays: number
  submissionData: ApiSubmissionData[]
}

interface DayData {
  date: Date
  count: number
  accepted: number
  submissions: ApiSubmissionData[]
}

export function SubmissionHeatmap({ studentId, filterDays, submissionData }: SubmissionHeatmapProps) {
  const [heatmapData, setHeatmapData] = useState<DayData[][]>([])
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    generateHeatmapData()
  }, [submissionData, filterDays])

  const generateHeatmapData = () => {
    const endDate = new Date()
    const startDate = subDays(endDate, filterDays - 1)

    // Generate all days in the range
    const allDays = eachDayOfInterval({ start: startDate, end: endDate })

    // Group submissions by day
    const submissionsByDay = new Map<string, ApiSubmissionData[]>()

    submissionData.forEach((submission) => {
      const submissionDate = new Date(submission.creationTimeSeconds * 1000)
      if (isValid(submissionDate)) {
        const dayKey = format(startOfDay(submissionDate), 'yyyy-MM-dd')
        if (!submissionsByDay.has(dayKey)) {
          submissionsByDay.set(dayKey, [])
        }
        submissionsByDay.get(dayKey)!.push(submission)
      }
    })

    // Create day data
    const dayDataMap = new Map<string, DayData>()
    allDays.forEach((date) => {
      const dayKey = format(date, 'yyyy-MM-dd')
      const daySubmissions = submissionsByDay.get(dayKey) || []
      const acceptedSubmissions = daySubmissions.filter(s => s.verdict === 'OK')

      dayDataMap.set(dayKey, {
        date,
        count: daySubmissions.length,
        accepted: acceptedSubmissions.length,
        submissions: daySubmissions,
      })
    })

    // Organize data into weeks (horizontal layout)
    // Start from the first Sunday before or on the start date
    const firstWeekStart = startOfWeek(startDate, { weekStartsOn: 0 }) // Sunday = 0
    const lastWeekEnd = endOfWeek(endDate, { weekStartsOn: 0 })

    // Calculate number of weeks needed
    const totalDays = Math.ceil((lastWeekEnd.getTime() - firstWeekStart.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const totalWeeks = Math.ceil(totalDays / 7)

    // Create 2D array: [week][day]
    const weeks: DayData[][] = []

    for (let weekIndex = 0; weekIndex < totalWeeks; weekIndex++) {
      const week: DayData[] = []

      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const currentDate = new Date(firstWeekStart)
        currentDate.setDate(firstWeekStart.getDate() + (weekIndex * 7) + dayIndex)

        const dayKey = format(currentDate, 'yyyy-MM-dd')
        const dayData = dayDataMap.get(dayKey)

        // Only include days within our actual range
        if (currentDate >= startDate && currentDate <= endDate) {
          week.push(dayData || {
            date: currentDate,
            count: 0,
            accepted: 0,
            submissions: [],
          })
        } else {
          // Add empty placeholder for days outside range
          week.push({
            date: currentDate,
            count: -1, // Special value to indicate out of range
            accepted: 0,
            submissions: [],
          })
        }
      }

      weeks.push(week)
    }

    setHeatmapData(weeks)
  }

  const getIntensity = (count: number): number => {
    if (count <= 0) return 0
    if (count <= 2) return 1
    if (count <= 5) return 2
    if (count <= 10) return 3
    return 4
  }

  const getIntensityColor = (intensity: number, isOutOfRange: boolean = false): string => {
    if (isOutOfRange) return 'bg-transparent'

    const colors = [
      'bg-muted/30 hover:bg-muted/50', // 0 submissions
      'bg-green-200 dark:bg-green-900/40 hover:bg-green-300 dark:hover:bg-green-900/60', // 1-2 submissions
      'bg-green-300 dark:bg-green-800/60 hover:bg-green-400 dark:hover:bg-green-800/80', // 3-5 submissions
      'bg-green-400 dark:bg-green-700/80 hover:bg-green-500 dark:hover:bg-green-700', // 6-10 submissions
      'bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-500', // 11+ submissions
    ]
    return colors[intensity] || colors[0]
  }

  const handleMouseEnter = (day: DayData, event: React.MouseEvent) => {
    if (day.count >= 0) { // Only show tooltip for valid days
      setHoveredDay(day)
      setMousePosition({ x: event.clientX, y: event.clientY })
    }
  }

  const handleMouseLeave = () => {
    setHoveredDay(null)
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    setMousePosition({ x: event.clientX, y: event.clientY })
  }

  const flatDayData = heatmapData.flat().filter(day => day.count >= 0)
  const maxSubmissions = Math.max(...flatDayData.map(d => d.count), 1)

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Submission activity over the last {filterDays} days</span>
        <div className="flex items-center gap-2">
          <span className="text-xs">Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((intensity) => (
              <div
                key={intensity}
                className={`w-3 h-3 rounded-sm border border-border ${getIntensityColor(intensity).split(' ')[0]}`}
              />
            ))}
          </div>
          <span className="text-xs">More</span>
        </div>
      </div>

      {/* Heatmap Grid - Horizontal Layout */}
      <div className="relative overflow-x-auto">
        <div className="flex gap-1 min-w-fit">
          {/* Day labels column */}
          <div className="flex flex-col gap-1 pr-2">
            <div className="h-3"></div> {/* Spacer for month labels */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
              <div key={day} className="text-xs text-muted-foreground h-3 flex items-center">
                {index % 2 === 1 ? day : ''} {/* Show only Mon, Wed, Fri to avoid crowding */}
              </div>
            ))}
          </div>

          {/* Weeks columns */}
          {heatmapData.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {/* Month label */}
              <div className="h-3 text-xs text-muted-foreground">
                {weekIndex === 0 || (week[0] && week[0].date.getDate() <= 7) ?
                  format(week[0]?.date || new Date(), 'MMM') : ''
                }
              </div>

              {/* Days in week */}
              {week.map((day, dayIndex) => {
                const intensity = getIntensity(day.count)
                const isOutOfRange = day.count < 0

                return (
                  <div
                    key={dayIndex}
                    className={`
                      w-3 h-3 rounded-sm transition-all duration-200 cursor-pointer
                      ${isOutOfRange ? '' : 'border border-border hover:ring-1 hover:ring-primary/50'}
                      ${getIntensityColor(intensity, isOutOfRange)}
                    `}
                    onMouseEnter={(e) => handleMouseEnter(day, e)}
                    onMouseLeave={handleMouseLeave}
                    onMouseMove={handleMouseMove}
                    title={isOutOfRange ? '' : `${format(day.date, 'MMM dd, yyyy')}: ${day.count} submissions, ${day.accepted} accepted`}
                  />
                )
              })}
            </div>
          ))}
        </div>

        {/* Tooltip */}
        {hoveredDay && hoveredDay.count >= 0 && (
          <div
            className="fixed z-50 bg-popover border border-border rounded-lg shadow-lg p-3 max-w-xs pointer-events-none"
            style={{
              left: mousePosition.x + 10,
              top: mousePosition.y - 10,
              transform: 'translateY(-100%)',
            }}
          >
            <div className="font-semibold text-sm">
              {format(hoveredDay.date, 'EEEE, MMM dd, yyyy')}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              <div>{hoveredDay.count} submission{hoveredDay.count !== 1 ? 's' : ''}</div>
              <div>{hoveredDay.accepted} accepted</div>
              {hoveredDay.count > 0 && (
                <div className="text-xs mt-1">
                  Success rate: {((hoveredDay.accepted / hoveredDay.count) * 100).toFixed(0)}%
                </div>
              )}
            </div>

            {/* Show recent problems */}
            {hoveredDay.submissions.length > 0 && (
              <div className="mt-2 text-xs">
                <div className="font-medium mb-1">Problems:</div>
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {hoveredDay.submissions.slice(0, 3).map((submission, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${submission.verdict === 'OK' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                      <span className="truncate">
                        {submission.problem.name}
                        {submission.problem.rating && ` (${submission.problem.rating})`}
                      </span>
                    </div>
                  ))}
                  {hoveredDay.submissions.length > 3 && (
                    <div className="text-muted-foreground">
                      +{hoveredDay.submissions.length - 3} more...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {flatDayData.reduce((sum, day) => sum + day.count, 0)}
          </div>
          <div className="text-sm text-muted-foreground">Total Submissions</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-500">
            {flatDayData.reduce((sum, day) => sum + day.accepted, 0)}
          </div>
          <div className="text-sm text-muted-foreground">Accepted</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-500">
            {flatDayData.filter(day => day.count > 0).length}
          </div>
          <div className="text-sm text-muted-foreground">Active Days</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-cyan-500">
            {maxSubmissions}
          </div>
          <div className="text-sm text-muted-foreground">Max Per Day</div>
        </div>
      </div>
    </div>
  )
}
