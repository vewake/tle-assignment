import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Plus, Loader2, User, Trophy } from "lucide-react"
import { getRatingColor } from "./getRatingColor"
import { API_ENDPOINTS } from "@/constants/apiConstants"

interface CodeforcesUser {
  rating?: number
  maxRating?: number
  handle: string
  firstName?: string
  lastName?: string
}

export function AddStudentDialog({ open, onOpenChange, onAdd }: any) {
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

  // Debounced function to fetch Codeforces data
  useEffect(() => {
    const fetchCodeforcesData = async () => {
      if (!formData.codeforcesHandle.trim()) {
        setCodeforcesData(null)
        setHandleError(null)
        return
      }

      setIsFetchingRating(true)
      setHandleError(null)

      try {
        const response = await fetch(
          `https://codeforces.com/api/user.info?handles=${formData.codeforcesHandle.trim()}`
        )
        const data = await response.json()

        if (data.status !== "OK" || !data.result || data.result.length === 0) {
          setHandleError("User not found on Codeforces")
          setCodeforcesData(null)
          return
        }

        const userInfo = data.result[0]
        setCodeforcesData(userInfo)
        setHandleError(null)
      } catch (error) {
        setHandleError("Failed to fetch user data")
        setCodeforcesData(null)
      } finally {
        setIsFetchingRating(false)
      }
    }

    // Debounce the API call
    const timeoutId = setTimeout(fetchCodeforcesData, 500)
    return () => clearTimeout(timeoutId)
  }, [formData.codeforcesHandle])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.codeforcesHandle) {
      toast.error("Missing required fields", {
        description: "Please fill in all required fields",
      })
      return
    }

    if (handleError || !codeforcesData) {
      toast.error("Invalid Codeforces handle", {
        description: "Please enter a valid Codeforces handle",
      })
      return
    }

    setIsSubmitting(true)

    try {
      //TODO: remove this 
      const studentData = {
        ...formData,
      }

      // Send to backend API
      const response = await fetch(API_ENDPOINTS.addStudent, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(studentData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to create student")
      }

      const createdStudent = await response.json()

      // Call the onAdd callback with the created student
      onAdd(createdStudent)

      toast.success("Student added successfully", {
        description: `${formData.name} has been added to the system`,
      })

      // Reset form
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

      onOpenChange(false)
    } catch (error) {
      console.error("Error adding student:", error)
      toast.error("Failed to add student", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Student
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter student name"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="Enter email address"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="Enter phone number"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="handle">Codeforces Handle *</Label>
            <div className="relative">
              <Input
                id="handle"
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
                    <span className={`font-semibold ${getRatingColor(codeforcesData.rating || 0)}`}>
                      {codeforcesData.rating || "Unrated"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="h-3 w-3" />
                    <span>Max:</span>
                    <span className={`font-semibold ${getRatingColor(codeforcesData.maxRating || 0)}`}>
                      {codeforcesData.maxRating || "Unrated"}
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="reminders">Email Reminders</Label>
            <Switch
              id="reminders"
              checked={formData.emailRemindersEnabled}
              onCheckedChange={(checked: any) => setFormData((prev) => ({ ...prev, emailRemindersEnabled: checked }))}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="active">Active Status</Label>
            <Switch
              id="active"
              checked={formData.isActive}
              onCheckedChange={(checked: any) => setFormData((prev) => ({ ...prev, isActive: checked }))}
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
              disabled={isSubmitting || isFetchingRating || !!handleError || !codeforcesData}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Student"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
