"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, CheckSquare, Clock, Target } from "lucide-react"
import type { Project } from "@/lib/api"
import TaskCard from "./task-card"
import CreateTaskDialog from "./create-task-dialog"

interface KanbanBoardProps {
  project: Project
  onTaskUpdate: () => void
}

export default function KanbanBoard({ project, onTaskUpdate }: KanbanBoardProps) {
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [selectedColumn, setSelectedColumn] = useState<"To Do" | "In Progress" | "Completed">("To Do")

  const columns = [
    {
      id: "To Do",
      title: "To Do",
      color: "bg-slate-50 border-slate-200",
      icon: Clock,
      badgeColor: "bg-slate-100 text-slate-700",
    },
    {
      id: "In Progress",
      title: "In Progress",
      color: "bg-blue-50 border-blue-200",
      icon: Target,
      badgeColor: "bg-blue-100 text-blue-700",
    },
    {
      id: "Completed",
      title: "Completed",
      color: "bg-emerald-50 border-emerald-200",
      icon: CheckSquare,
      badgeColor: "bg-emerald-100 text-emerald-700",
    },
  ] as const

  const getTasksByStatus = (status: string) => {
    return project.tasks?.filter((task) => task.status === status) || []
  }

  const handleCreateTask = (columnId: "To Do" | "In Progress" | "Completed") => {
    setSelectedColumn(columnId)
    setShowCreateTask(true)
  }

  return (
    <div className="h-full p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        {columns.map((column) => {
          const tasks = getTasksByStatus(column.id)
          const IconComponent = column.icon

          return (
            <div key={column.id} className="flex flex-col h-full">
              {/* Column Header */}
              <div className={`${column.color} rounded-2xl p-5 mb-4 border shadow-sm backdrop-blur-sm`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <IconComponent className="h-5 w-5 text-gray-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{column.title}</h3>
                      <Badge className={`${column.badgeColor} text-xs font-medium`}>
                        {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-white/70 transition-all duration-200 rounded-xl"
                  onClick={() => handleCreateTask(column.id)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add new task
                </Button>
              </div>

              {/* Tasks Container */}
              <div className="flex-1 space-y-3 overflow-y-auto">
                {tasks.map((task, index) => (
                  <TaskCard
                    key={`${column.id}-task-${task._id}-${index}`}
                    task={task}
                    project={project}
                    onTaskUpdate={onTaskUpdate}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <CreateTaskDialog
        open={showCreateTask}
        onOpenChange={setShowCreateTask}
        project={project}
        defaultStatus={selectedColumn}
        onTaskCreated={onTaskUpdate}
      />
    </div>
  )
}
