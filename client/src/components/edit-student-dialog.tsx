import type React from "react"
import { useState, useEffect, useCallback } from "react"
import type { Student } from "@/types/student"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Edit, Loader2, User, Trophy } from "lucide-react"
import { getRatingColor } from "./getRatingColor"
import { API_ENDPOINTS } from "@/constants/apiConstants"

interface CodeforcesUser {
  rating?: number
  maxRating?: number
  handle: string
  firstName?: string
  lastName?: string
}

interface EditStudentDialogProps {
  student: Student | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (student: Student) => void
}

export function EditStudentDialog({ student, open, onOpenChange, onSave }: EditStudentDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    codeforcesHandle: "",
    emailRemindersEnabled: true,
    isActive: true,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFetchingRating, setIsFetchingRating] = useState(false)
  const [codeforcesData, setCodeforcesData] = useState<CodeforcesUser | null>(null)
  const [handleError, setHandleError] = useState<string | null>(null)
  const [originalHandle, setOriginalHandle] = useState("")
  const [lastFetchedHandle, setLastFetchedHandle] = useState("")

  // Reset all state when dialog closes
  useEffect(() => {
    if (!open) {
      setFormData({
        name: "",
        email: "",
        phone: "",
        codeforcesHandle: "",
        emailRemindersEnabled: true,
        isActive: true,
      })
      setCodeforcesData(null)
      setHandleError(null)
      setOriginalHandle("")
      setLastFetchedHandle("")
      setIsFetchingRating(false)
      setIsSubmitting(false)
    }
  }, [open])

  // Initialize form data when student changes and dialog is open
  useEffect(() => {
    if (student && open) {
      setFormData({
        name: student.name,
        email: student.email,
        phone: student.phone,
        codeforcesHandle: student.codeforcesHandle,
        emailRemindersEnabled: student.emailRemindersEnabled,
        isActive: student.isActive,
      })
      setOriginalHandle(student.codeforcesHandle)
      setLastFetchedHandle(student.codeforcesHandle)

      // Set initial Codeforces data if available
      if (student.currentRating || student.maxRating) {
        setCodeforcesData({
          handle: student.codeforcesHandle,
          rating: student.currentRating,
          maxRating: student.maxRating,
        })
      } else {
        setCodeforcesData(null)
      }
      setHandleError(null)
    }
  }, [student, open])

  // Memoized fetch function to prevent recreation on every render
  const fetchCodeforcesData = useCallback(async (handle: string) => {
    if (!handle.trim()) {
      setCodeforcesData(null)
      setHandleError(null)
      setLastFetchedHandle("")
      return
    }

    // If we already fetched this handle, don't fetch again
    if (handle === lastFetchedHandle) {
      return
    }

    setIsFetchingRating(true)
    setHandleError(null)

    try {
      const response = await fetch(
        `https://codeforces.com/api/user.info?handles=${handle.trim()}`
      )
      const data = await response.json()

      // Check if the handle is still the current one (user might have changed it while fetching)
      if (handle !== formData.codeforcesHandle.trim()) {
        return
      }

      if (data.status !== "OK" || !data.result || data.result.length === 0) {
        setHandleError("User not found on Codeforces")
        setCodeforcesData(null)
      } else {
        const userInfo = data.result[0]
        setCodeforcesData(userInfo)
        setHandleError(null)
        setLastFetchedHandle(handle)
      }
    } catch (error) {
      // Check if the handle is still the current one
      if (handle !== formData.codeforcesHandle.trim()) {
        return
      }
      setHandleError("Failed to fetch user data")
      setCodeforcesData(null)
    } finally {
      setIsFetchingRating(false)
    }
  }, [formData.codeforcesHandle, lastFetchedHandle])

  // Debounced effect for fetching Codeforces data
  useEffect(() => {
    if (!open) return

    const currentHandle = formData.codeforcesHandle.trim()

    // If handle is empty, clear data
    if (!currentHandle) {
      setCodeforcesData(null)
      setHandleError(null)
      setLastFetchedHandle("")
      return
    }

    // If handle is the same as original and we have data, don't fetch
    if (currentHandle === originalHandle && codeforcesData && !handleError) {
      return
    }

    // If we already fetched this handle, don't fetch again
    if (currentHandle === lastFetchedHandle) {
      return
    }

    // Only fetch if handle is different from what we last fetched
    const timeoutId = setTimeout(() => {
      fetchCodeforcesData(currentHandle)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [formData.codeforcesHandle, open, originalHandle, lastFetchedHandle, fetchCodeforcesData, codeforcesData, handleError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!student || !formData.name || !formData.email || !formData.codeforcesHandle) {
      toast.error("Missing required fields", {
        description: "Please fill in all required fields",
      })
      return
    }

    const handleChanged = formData.codeforcesHandle !== originalHandle

    if (handleChanged && (handleError || !codeforcesData)) {
      toast.error("Invalid Codeforces handle", {
        description: "Please enter a valid Codeforces handle",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const studentData = {
        ...formData,
        id: student._id,
      }

      // Send to backend API
      const response = await fetch(`${API_ENDPOINTS.updateStudent}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(studentData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to update student")
      }

      const updatedStudent = await response.json()

      // Call the onSave callback with the updated student
      onSave(updatedStudent)

      toast.success("Student updated successfully", {
        description: `${formData.name} has been updated`,
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Error updating student:", error)
      toast.error("Failed to update student", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!student) return null

  const handleChanged = formData.codeforcesHandle !== originalHandle

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Student
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter student name"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-email">Email *</Label>
            <Input
              id="edit-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="Enter email address"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-phone">Phone</Label>
            <Input
              id="edit-phone"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="Enter phone number"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-handle">Codeforces Handle *</Label>
            <div className="relative">
              <Input
                id="edit-handle"
                value={formData.codeforcesHandle}
                onChange={(e) => setFormData((prev) => ({ ...prev, codeforcesHandle: e.target.value }))}
                placeholder="Enter Codeforces handle"
                required
                disabled={isSubmitting}
                className={handleError ? "border-red-500" : ""}
              />
              {isFetchingRating && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>

            {handleChanged && (
              <p className="text-xs text-muted-foreground">
                Changing the handle will trigger a real-time data sync.
              </p>
            )}

            {handleError && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <User className="h-3 w-3" />
                {handleError}
              </p>
            )}

            {codeforcesData && !handleError && (
              <div className="p-3 bg-muted rounded-md space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{codeforcesData.handle}</span>
                  {codeforcesData.firstName && (
                    <span className="text-muted-foreground">
                      ({codeforcesData.firstName} {codeforcesData.lastName})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Trophy className="h-3 w-3" />
                    <span>Current:</span>
                    <span
                      className="font-semibold"
                      style={{ color: getRatingColor(codeforcesData.rating || 0) }}
                    >
                      {codeforcesData.rating || "Unrated"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="h-3 w-3" />
                    <span>Max:</span>
                    <span
                      className="font-semibold"
                      style={{ color: getRatingColor(codeforcesData.maxRating || 0) }}
                    >
                      {codeforcesData.maxRating || "Unrated"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="edit-reminders">Email Reminders</Label>
            <Switch
              id="edit-reminders"
              checked={formData.emailRemindersEnabled}
              onCheckedChange={(checked: boolean) => setFormData((prev) => ({ ...prev, emailRemindersEnabled: checked }))}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="edit-active">Active Status</Label>
            <Switch
              id="edit-active"
              checked={formData.isActive}
              onCheckedChange={(checked: boolean) => setFormData((prev) => ({ ...prev, isActive: checked }))}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isFetchingRating || (handleChanged && (!!handleError || !codeforcesData))}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
