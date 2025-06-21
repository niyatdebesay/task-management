"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiClient, type Project, type Task } from "@/lib/api"
import { Loader2, UserPlus } from "lucide-react"

interface AssignTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task
  project: Project
  onTaskUpdated: () => void
}

export default function AssignTaskDialog({ open, onOpenChange, task, project, onTaskUpdated }: AssignTaskDialogProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (task && open) {
      setSelectedUsers(task.assignedTo.map((user) => user._id))
    }
  }, [task, open])

  const handleUserToggle = (userId: string) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleSubmit = async () => {
    setError("")
    setIsLoading(true)

    try {
      // Get current assigned users
      const currentAssignedIds = task.assignedTo.map((user) => user._id)

      // Find users to add and remove
      const usersToAdd = selectedUsers.filter((id) => !currentAssignedIds.includes(id))
      const usersToRemove = currentAssignedIds.filter((id) => !selectedUsers.includes(id))

      // Add new users
      for (const userId of usersToAdd) {
        await apiClient.assignTaskToUser(task._id, userId)
      }

      // Remove users
      for (const userId of usersToRemove) {
        await apiClient.removeUserFromTask(task._id, userId)
      }

      onTaskUpdated()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task assignments")
    } finally {
      setIsLoading(false)
    }
  }

  const availableUsers = project.teamMembers || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Task</DialogTitle>
          <DialogDescription>Select team members to assign to {task.title}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {availableUsers.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No team members available. Add members to the project first.
            </p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {availableUsers.map((user) => {
                const isSelected = selectedUsers.includes(user._id)
                const isCurrentlyAssigned = task.assignedTo.some((assignedUser) => assignedUser._id === user._id)

                return (
                  <div key={user._id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleUserToggle(user._id)}
                      disabled={isLoading}
                    />
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-sm">
                        {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{user.username}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    {isCurrentlyAssigned && (
                      <Badge variant="outline" className="text-xs">
                        Currently Assigned
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || availableUsers.length === 0}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Update Assignments
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
