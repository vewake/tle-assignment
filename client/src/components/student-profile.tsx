import { useState } from "react"
import type { Student } from "@/types/student"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ContestHistory } from "@/components/contest-history"
import { ProblemSolvingData } from "@/components/problem-solving-data"
import { ArrowLeft, User, Mail, Phone, Code, Trophy, TrendingUp } from "lucide-react"
import { getRatingColor } from "./getRatingColor"

interface StudentProfileProps {
  student: Student
  onBack: () => void
}

export function StudentProfile({ student, onBack }: StudentProfileProps) {
  const [contestFilter, setContestFilter] = useState("30")
  const [problemFilter, setProblemFilter] = useState("30")

  return (

    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Students
        </Button>
        <div className="flex items-center gap-2">
          <User className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">{student.name}</h1>
        </div>
      </div>

      {/* Student Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Student Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                Email
              </div>
              <p className="font-medium">{student.email}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                Phone
              </div>
              <p className="font-medium">{student.phone}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Code className="h-4 w-4" />
                Codeforces Handle
              </div>
              <code className="bg-muted px-2 py-1 rounded text-sm font-medium">{student.codeforcesHandle}</code>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Trophy className="h-4 w-4" />
                Status
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={student.isActive ? "default" : "secondary"}>
                  {student.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rating Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Current Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getRatingColor(student.currentRating)}`}>{student.currentRating}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Max Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getRatingColor(student.maxRating)}`}>{student.maxRating}</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Tabs */}
      <Tabs defaultValue="contests" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="contests">Contest History</TabsTrigger>
          <TabsTrigger value="problems">Problem Solving</TabsTrigger>
        </TabsList>

        <TabsContent value="contests" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>Contest History</CardTitle>
                <Select value={contestFilter} onValueChange={setContestFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="365">Last 365 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ContestHistory studentId={student.id} filterDays={Number.parseInt(contestFilter)} contestData={student.codeforcesData.contests} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="problems" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>Problem Solving Data</CardTitle>
                <Select value={problemFilter} onValueChange={setProblemFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ProblemSolvingData studentId={student.id} filterDays={Number.parseInt(problemFilter)} submissionData={student.codeforcesData.submissions} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
