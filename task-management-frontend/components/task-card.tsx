"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, MoreHorizontal, Edit, Trash2, UserPlus, Clock } from "lucide-react"
import type { Project, Task } from "@/lib/api"
import { apiClient } from "@/lib/api"
import EditTaskDialog from "./edit-task-dialog"
import AssignTaskDialog from "./assign-task-dialog"

interface TaskCardProps {
  task: Task
  project: Project
  onTaskUpdate: () => void
}

export default function TaskCard({ task, project, onTaskUpdate }: TaskCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800 border-red-200"
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "LOW":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return "Overdue"
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Tomorrow"
    return date.toLocaleDateString()
  }

  const isOverdue = (dateString?: string) => {
    if (!dateString) return false
    return new Date(dateString) < new Date()
  }

  const handleDeleteTask = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return

    setIsDeleting(true)
    try {
      await apiClient.deleteTask(task._id)
      onTaskUpdate()
    } catch (error) {
      console.error("Failed to delete task:", error)
      alert("Failed to delete task. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleQuickStatusChange = async (newStatus: "To Do" | "In Progress" | "Completed") => {
    try {
      await apiClient.updateTaskStatus(task._id, newStatus)
      onTaskUpdate()
    } catch (error) {
      console.error("Failed to update task status:", error)
    }
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow cursor-pointer group">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Task
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowAssignDialog(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Assign Users
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleQuickStatusChange("To Do")}>
                  <Clock className="mr-2 h-4 w-4" />
                  Move to To Do
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleQuickStatusChange("In Progress")}>
                  <Clock className="mr-2 h-4 w-4" />
                  Move to In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleQuickStatusChange("Completed")}>
                  <Clock className="mr-2 h-4 w-4" />
                  Mark Complete
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600" onClick={handleDeleteTask} disabled={isDeleting}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? "Deleting..." : "Delete Task"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {task.description && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{task.description}</p>}
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {task.priority && <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>{task.priority}</Badge>}
              {task.deadline && (
                <div
                  className={`flex items-center space-x-1 text-xs ${
                    isOverdue(task.deadline) ? "text-red-600" : "text-gray-600"
                  }`}
                >
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(task.deadline)}</span>
                </div>
              )}
            </div>

            {task.assignedTo && task.assignedTo.length > 0 && (
              <div className="flex -space-x-1">
                {task.assignedTo.slice(0, 2).map((user) => (
                  <Avatar key={user._id} className="h-5 w-5 border border-white">
                    <AvatarFallback className="text-xs">
                      {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {task.assignedTo.length > 2 && (
                  <div className="h-5 w-5 rounded-full bg-gray-200 border border-white flex items-center justify-center">
                    <span className="text-xs text-gray-600">+{task.assignedTo.length - 2}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <EditTaskDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        task={task}
        project={project}
        onTaskUpdated={onTaskUpdate}
      />

      <AssignTaskDialog
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        task={task}
        project={project}
        onTaskUpdated={onTaskUpdate}
      />
    </>
  )
}
