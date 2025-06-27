import { useState } from "react"
import type { Student } from "@/types/student"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { EditStudentDialog } from "@/components/edit-student-dialog"
import { MoreHorizontal, Eye, Edit, Trash2, Search, Mail, MailX } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { getRatingColor } from "./getRatingColor"

interface StudentTableProps {
  students: Student[]
  loading: boolean
  onEdit: (student: Student) => void
  onDelete: (studentId: string) => void
  onView: (student: Student) => void
}

export function StudentTable({ students, loading, onEdit, onDelete, onView }: StudentTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.codeforcesHandle.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEdit = (student: Student) => {
    setEditingStudent(student)
  }

  const handleEditSave = (updatedStudent: Student) => {
    onEdit(updatedStudent)
    setEditingStudent(null)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-xl">Students ({students.length})</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead>CF Handle</TableHead>
                  <TableHead className="text-center">Current</TableHead>
                  <TableHead className="text-center hidden sm:table-cell">Max</TableHead>
                  <TableHead className="hidden lg:table-cell">Last Updated</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{student.name}</span>
                        <span className="text-sm text-muted-foreground sm:hidden">{student.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{student.email}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{student.phone}</TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">{student.codeforcesHandle}</code>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`font-semibold ${getRatingColor(student.currentRating)}`}>
                        {student.currentRating}
                      </span>
                    </TableCell>
                    <TableCell className="text-center hidden sm:table-cell">
                      <span className={`font-semibold ${getRatingColor(student.maxRating)}`}>{student.maxRating}</span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                      {formatDistanceToNow(student.lastUpdated, { addSuffix: true })}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Badge variant={student.isActive ? "default" : "secondary"}>
                          {student.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {student.emailRemindersEnabled ? (
                          <Mail className="h-4 w-4 text-green-500" />
                        ) : (
                          <MailX className="h-4 w-4 text-muted-foreground" />
                        )}
                        {student.reminderCount > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {student.reminderCount}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(student)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(student)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDelete(student._id)} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredStudents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? "No students found matching your search." : "No students added yet."}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <EditStudentDialog
        student={editingStudent}
        open={!!editingStudent}
        onOpenChange={(open) => !open && setEditingStudent(null)}
        onSave={handleEditSave}
      />
    </>
  )
}
