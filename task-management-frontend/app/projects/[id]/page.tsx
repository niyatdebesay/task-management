"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import ProtectedRoute from "@/components/protected-route"
import DashboardLayout from "@/components/dashboard-layout"
import KanbanBoard from "@/components/kanban-board"
import ProjectHeader from "@/components/project-header"
import { apiClient, type Project } from "@/lib/api"
import { Loader2 } from "lucide-react"

export default function ProjectPage() {
  const params = useParams()
  const { user } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (params.id && user) {
      fetchProject()
    }
  }, [params.id, user])

  const fetchProject = async () => {
    try {
      const data = await apiClient.getProject(params.id as string)
      setProject(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch project")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (error || !project) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex flex-col items-center justify-center h-64">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Project not found</h2>
            <p className="text-gray-600">{error || "The project you're looking for doesn't exist."}</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="h-full flex flex-col">
          <ProjectHeader project={project} onProjectUpdate={fetchProject} />
          <div className="flex-1 overflow-hidden">
            <KanbanBoard project={project} onTaskUpdate={fetchProject} />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
