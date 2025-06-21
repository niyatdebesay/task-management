"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Users, Settings, UserPlus, MoreHorizontal, Calendar, Clock, Target } from "lucide-react"
import type { Project } from "@/lib/api"
import InviteUserDialog from "./invite-user-dialog"

interface ProjectHeaderProps {
  project: Project
}

export default function ProjectHeader({ project }: ProjectHeaderProps) {
  const [showInviteDialog, setShowInviteDialog] = useState(false)

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-500 text-white border-red-500"
      case "MEDIUM":
        return "bg-amber-500 text-white border-amber-500"
      case "LOW":
        return "bg-emerald-500 text-white border-emerald-500"
      default:
        return "bg-gray-500 text-white border-gray-500"
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const isOverdue = (dateString?: string) => {
    if (!dateString) return false
    return new Date(dateString) < new Date()
  }

  const getTaskStats = () => {
    const tasks = project.tasks || []
    const completed = tasks.filter((task) => task.status === "Completed").length
    const inProgress = tasks.filter((task) => task.status === "In Progress").length
    const todo = tasks.filter((task) => task.status === "To Do").length
    return { total: tasks.length, completed, inProgress, todo }
  }

  const stats = getTaskStats()

  return (
    <TooltipProvider>
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-8 py-6">
          {/* Main Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                {project.priority && (
                  <Badge className={`${getPriorityColor(project.priority)} px-3 py-1 text-sm font-medium`}>
                    {project.priority}
                  </Badge>
                )}
              </div>
              {project.description && (
                <p className="text-gray-600 text-lg leading-relaxed max-w-3xl">{project.description}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowInviteDialog(true)}
                className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="hover:bg-gray-50">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Project Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Users className="mr-2 h-4 w-4" />
                    Manage Members
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Stats and Info Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              {/* Task Stats */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Target className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{stats.total} Tasks</p>
                    <p className="text-xs text-gray-500">{stats.completed} completed</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{stats.inProgress} In Progress</p>
                    <p className="text-xs text-gray-500">{stats.todo} to do</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Users className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{project.teamMembers?.length || 0} Members</p>
                    <p className="text-xs text-gray-500">Active team</p>
                  </div>
                </div>
              </div>

              {/* Deadline */}
              {project.deadline && (
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${isOverdue(project.deadline) ? "bg-red-100" : "bg-gray-100"}`}>
                    <Calendar className={`h-4 w-4 ${isOverdue(project.deadline) ? "text-red-600" : "text-gray-600"}`} />
                  </div>
                  <div>
                    <p
                      className={`text-sm font-medium ${isOverdue(project.deadline) ? "text-red-900" : "text-gray-900"}`}
                    >
                      Due {formatDate(project.deadline)}
                    </p>
                    <p className={`text-xs ${isOverdue(project.deadline) ? "text-red-600" : "text-gray-500"}`}>
                      {isOverdue(project.deadline) ? "Overdue" : "Deadline"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Team Members */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 font-medium">Team:</span>
              <div className="flex -space-x-2">
                {project.teamMembers?.slice(0, 5).map((member) => (
                  <Tooltip key={member._id}>
                    <TooltipTrigger asChild>
                      <Avatar className="h-10 w-10 border-2 border-white ring-2 ring-gray-100 hover:ring-blue-300 transition-all cursor-pointer">
                        <AvatarFallback className="text-sm bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                          {member.username?.charAt(0).toUpperCase() || member.email?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-center">
                        <p className="font-medium">{member.username}</p>
                        <p className="text-xs opacity-90">{member.email}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
                {project.teamMembers?.length > 5 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="h-10 w-10 rounded-full bg-gray-100 border-2 border-white ring-2 ring-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                        <span className="text-sm text-gray-600 font-medium">+{project.teamMembers.length - 5}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{project.teamMembers.length - 5} more members</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>
        </div>

        <InviteUserDialog
          open={showInviteDialog}
          onOpenChange={setShowInviteDialog}
          projectId={project._id}
        />
      </div>
    </TooltipProvider>
  )
}
