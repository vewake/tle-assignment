import { useState, useEffect } from "react"
import { StudentTable } from "@/components/student-table"
import { StudentProfile } from "@/components/student-profile"
import { AddStudentDialog } from "@/components/add-student-dialog"
import { SettingsDialog } from "@/components/settings-dialog"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Settings, Users, Download } from "lucide-react"
import type { Student } from "@/types/student"
import { API_ENDPOINTS } from "./constants/apiConstants"
import axios from "axios"
import { toast } from "sonner"

export default function HomePage() {
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      let response = await fetch(API_ENDPOINTS.getAllStudents);
      if (!response.ok) {
        throw new Error("Failed to fetch students")
      }
      const data = await response.json()
      setStudents(data)


    } catch (error) {
      console.error("Failed to fetch students:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddStudent = (student: Omit<Student, "id" | "lastUpdated" | "reminderCount">) => {
    const newStudent: Student = {
      ...student,
      id: Date.now().toString(),
      lastUpdated: new Date(),
      reminderCount: 0,
    }
    setStudents((prev) => [...prev, newStudent])
  }

  const handleEditStudent = (updatedStudent: Student) => {
    setStudents((prev) => prev.map((s) => (s._id == updatedStudent._id ? updatedStudent : s)))
  }

  const handleDeleteStudent = async (studentId: string) => {
    try {
      await axios.delete(`${API_ENDPOINTS.deleteStudent}/${studentId}`)
      toast.success("Student deleted successfully")
      setStudents((prev) => prev.filter((s) => s._id !== studentId))
      if (selectedStudent?._id == studentId) {
        setSelectedStudent(null)
      }
    } catch (error) {
      console.error("Failed to delete student:", error)
      toast.error("Failed to delete student. Please try again.")
    }

    setStudents((prev) => prev.filter((s) => s._id !== studentId))
    if (selectedStudent?._id == studentId) {
      setSelectedStudent(null)
    }
  }

  const handleViewStudent = async (student: Student) => {
    // Fetch detailed info from backend
    const response = await fetch(`${API_ENDPOINTS.getDetails}/${student._id}`);
    const detailedStudent = await response.json();
    setSelectedStudent(detailedStudent);
  }

  const handleBackToTable = () => {
    setSelectedStudent(null)
  }

  const downloadCSV = () => {
    const headers = ["Name", "Email", "Phone", "CF Handle", "Current Rating", "Max Rating", "Last Updated"]
    const csvContent = [
      headers.join(","),
      ...students.map((student) =>
        [
          student.name,
          student.email,
          student.phone,
          student.codeforcesHandle,
          student.currentRating,
          student.maxRating,
          student.lastUpdated,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "students.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (selectedStudent) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-background">
          <StudentProfile student={selectedStudent} onBack={handleBackToTable} />
        </div>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-foreground">Student Progress Management</h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="outline" size="sm" onClick={downloadCSV} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>
              <Button onClick={() => setShowAddDialog(true)} className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Add Student
              </Button>
            </div>
          </div>

          {/* Student Table */}
          <StudentTable
            students={students}
            loading={loading}
            onEdit={handleEditStudent}
            onDelete={handleDeleteStudent}
            onView={handleViewStudent}
          />

          {/* Dialogs */}
          <AddStudentDialog open={showAddDialog} onOpenChange={setShowAddDialog} onAdd={handleAddStudent} />

          <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
        </div>
      </div>
    </ThemeProvider>
  )
}
