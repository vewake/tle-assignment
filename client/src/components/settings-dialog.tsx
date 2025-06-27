import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, Clock, Mail, Loader2 } from "lucide-react"
import { API_ENDPOINTS } from "@/constants/apiConstants"
import { toast } from "sonner"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [settings, setSettings] = useState({
    cronTime: "02:00",
    cronFrequency: "daily",
    emailEnabled: true,
    inactivityDays: 7,
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: "",
  })

  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  const handleSave = async () => {
    try {
      setIsSaving(true)

      const response = await fetch(API_ENDPOINTS.updateSettings, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      toast.success("Settings saved successfully")
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }




  const testCronJob = async () => {
    try {
      setIsTesting(true)
      toast.info("Sync started...")

      const response = await fetch(API_ENDPOINTS.testCronJob)

      if (!response.ok) {
        throw new Error("Failed to test sync")
      }
      const data = await response.json()
      // refetch the students
      //
      toast.success(`Sync successful! Updated ${data.updatedCount} students refresh the page to see changes.`)
    } catch (error) {
      console.error("Failed to test Sync:", error)
      toast.error("Failed to test Sync")
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cron Job Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Data Sync Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cronTime">Sync Time</Label>
                  <Input
                    id="cronTime"
                    type="time"
                    value={settings.cronTime}
                    onChange={(e) => setSettings((prev) => ({ ...prev, cronTime: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cronFreq">Frequency</Label>
                  <Select
                    value={settings.cronFrequency}
                    onValueChange={(value) => setSettings((prev) => ({ ...prev, cronFrequency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="twice-daily">Twice Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={testCronJob}
                variant="outline"
                size="sm"
                disabled={isTesting}
              >
                {isTesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test Sync Now'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="emailEnabled">Enable Email Reminders</Label>
                <Switch
                  id="emailEnabled"
                  checked={settings.emailEnabled}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, emailEnabled: checked }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inactivityDays">Inactivity Threshold (days)</Label>
                <Input
                  id="inactivityDays"
                  type="number"
                  min="1"
                  max="30"
                  value={settings.inactivityDays}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, inactivityDays: Number.parseInt(e.target.value) || 7 }))
                  }
                />
              </div>

              {settings.emailEnabled && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-medium">SMTP Configuration</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpHost">SMTP Host</Label>
                      <Input
                        id="smtpHost"
                        value={settings.smtpHost}
                        onChange={(e) => setSettings((prev) => ({ ...prev, smtpHost: e.target.value }))}
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPort">SMTP Port</Label>
                      <Input
                        id="smtpPort"
                        type="number"
                        value={settings.smtpPort}
                        onChange={(e) =>
                          setSettings((prev) => ({ ...prev, smtpPort: Number.parseInt(e.target.value) || 587 }))
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpUser">SMTP Username</Label>
                    <Input
                      id="smtpUser"
                      value={settings.smtpUser}
                      onChange={(e) => setSettings((prev) => ({ ...prev, smtpUser: e.target.value }))}
                      placeholder="your-email@gmail.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPassword">SMTP Password</Label>
                    <Input
                      id="smtpPassword"
                      type="password"
                      value={settings.smtpPassword}
                      onChange={(e) => setSettings((prev) => ({ ...prev, smtpPassword: e.target.value }))}
                      placeholder="App password"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
