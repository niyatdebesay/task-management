"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import ProtectedRoute from "@/components/protected-route"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Plus,
  Users,
  Calendar,
  FolderOpen,
  UserCheck,
  MoreHorizontal,
  Edit,
  Trash2,
  Settings,
  ArrowRight,
  Clock,
  Target,
} from "lucide-react"
import { apiClient, type Project } from "@/lib/api"
import Link from "next/link"
import CreateProjectDialog from "@/components/create-project-dialog"
import EditProjectDialog from "@/components/edit-project-dialog"

export default function ProjectsPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<{ ownedProjects: Project[]; userProjects: Project[] }>({
    ownedProjects: [],
    userProjects: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const fetchProjects = useCallback(async () => {
    try {
      const data = await apiClient.getUserProjects(user!._id)
      setProjects(data)
    } catch (error) {
      console.error("Failed to fetch projects:", error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchProjects()
    }
  }, [user, fetchProjects])

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) return

    try {
      await apiClient.deleteProject(projectId)
      await fetchProjects()
    } catch (error) {
      console.error("Failed to delete project:", error)
      alert("Failed to delete project. Please try again.")
    }
  }

  const handleEditProject = (project: Project) => {
    setSelectedProject(project)
    setShowEditDialog(true)
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-500 text-white"
      case "MEDIUM":
        return "bg-amber-500 text-white"
      case "LOW":
        return "bg-emerald-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const isOverdue = (dateString?: string) => {
    if (!dateString) return false
    return new Date(dateString) < new Date()
  }

  const getTaskStats = (project: Project) => {
    const tasks = project.tasks || []
    const completed = tasks.filter((task) => task.status === "Completed").length
    const inProgress = tasks.filter((task) => task.status === "In Progress").length
    return { total: tasks.length, completed, inProgress }
  }

  // Filter invited projects (projects where user is a member but not the owner)
  const getInvitedProjects = () => {
    const ownedProjectIds = new Set(projects.ownedProjects.map((p) => p._id))
    return projects.userProjects.filter((project) => !ownedProjectIds.has(project._id))
  }

  const ProjectCard = ({ project, type }: { project: Project; type: "owned" | "invited" }) => {
    const stats = getTaskStats(project)
    const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

    return (
      <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <CardHeader className="pb-4 relative z-10">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Link href={`/projects/${project._id}`} className="flex-1 group/link">
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover/link:text-blue-600 transition-colors line-clamp-1">
                    {project.name}
                  </CardTitle>
                </Link>
                {type === "invited" && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
                    <UserCheck className="h-3 w-3 mr-1" />
                    Invited
                  </Badge>
                )}
              </div>
              <CardDescription className="text-gray-600 line-clamp-2 text-sm leading-relaxed">
                {project.description || "No description provided"}
              </CardDescription>
            </div>

            {type === "owned" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-gray-100"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => handleEditProject(project)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Project
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteProject(project._id)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Priority and Deadline */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {project.priority && (
                <Badge className={`${getPriorityColor(project.priority)} px-2 py-1 text-xs font-semibold`}>
                  {project.priority}
                </Badge>
              )}
            </div>
            {project.deadline && (
              <div
                className={`flex items-center gap-1 text-xs font-medium ${
                  isOverdue(project.deadline) ? "text-red-600" : "text-gray-600"
                }`}
              >
                <Calendar className="h-3 w-3" />
                <span>{formatDate(project.deadline)}</span>
                {isOverdue(project.deadline) && <span className="text-red-600">(Overdue)</span>}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0 relative z-10">
          {/* Progress Bar */}
          {stats.total > 0 && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm font-bold text-gray-900">{completionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Target className="h-4 w-4 text-gray-600" />
              </div>
              <p className="text-lg font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-600">Tasks</p>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-lg font-bold text-blue-900">{stats.inProgress}</p>
              <p className="text-xs text-blue-600">Active</p>
            </div>
            <div className="text-center p-2 bg-emerald-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Users className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-lg font-bold text-emerald-900">{project.teamMembers?.length || 0}</p>
              <p className="text-xs text-emerald-600">Members</p>
            </div>
          </div>

          {/* Team Members with Tooltips */}
          <TooltipProvider>
            <div className="flex items-center justify-between">
              <div className="flex -space-x-2">
                {project.teamMembers?.slice(0, 4).map((member, index) => (
                  <Tooltip key={`${type}-${project._id}-member-${member._id}-${index}`}>
                    <TooltipTrigger asChild>
                      <Avatar className="h-8 w-8 border-2 border-white ring-2 ring-gray-100 hover:ring-blue-300 transition-all cursor-pointer hover:scale-110">
                        <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
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
                {project.teamMembers?.length > 4 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white ring-2 ring-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-all hover:scale-110">
                        <span className="text-xs text-gray-600 font-medium">+{project.teamMembers.length - 4}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{project.teamMembers.length - 4} more members</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>

              <Link href={`/projects/${project._id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 group/btn"
                >
                  View Project
                  <ArrowRight className="ml-2 h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>
    )
  }

  const EmptyState = ({ type }: { type: "owned" | "invited" }) => (
    <Card className="border-dashed border-2 border-gray-200 bg-gray-50/50">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="text-gray-400 mb-6">
          {type === "owned" ? <FolderOpen className="h-16 w-16" /> : <UserCheck className="h-16 w-16" />}
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          {type === "owned" ? "No projects yet" : "No invited projects"}
        </h3>
        <p className="text-gray-600 text-center mb-6 max-w-md">
          {type === "owned"
            ? "Create your first project to start organizing your tasks and collaborating with your team"
            : "You haven't been invited to any projects yet. Ask your team members to invite you!"}
        </p>
        {type === "owned" && (
          <Button
            onClick={() => setShowCreateDialog(true)}
            size="lg"
            className="shadow-lg hover:shadow-xl transition-shadow"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Project
          </Button>
        )}
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  const invitedProjects = getInvitedProjects()

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="px-4 py-6 sm:px-0">
          {/* Modern Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Projects</h1>
              <p className="text-lg text-gray-600">Manage your projects and collaborate with your team</p>
            </div>
            <Button
              onClick={() => setShowCreateDialog(true)}
              size="lg"
              className="shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Project
            </Button>
          </div>

          <Tabs defaultValue="owned" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 p-1 rounded-xl h-12">
              <TabsTrigger
                value="owned"
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg font-medium"
              >
                <FolderOpen className="h-4 w-4" />
                My Projects ({projects.ownedProjects.length})
              </TabsTrigger>
              <TabsTrigger
                value="invited"
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg font-medium"
              >
                <UserCheck className="h-4 w-4" />
                Invited Projects ({invitedProjects.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="owned" className="space-y-6">
              {projects.ownedProjects.length === 0 ? (
                <EmptyState type="owned" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {projects.ownedProjects.map((project) => (
                    <ProjectCard key={`owned-${project._id}`} project={project} type="owned" />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="invited" className="space-y-6">
              {invitedProjects.length === 0 ? (
                <EmptyState type="invited" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {invitedProjects.map((project) => (
                    <ProjectCard key={`invited-${project._id}`} project={project} type="invited" />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <CreateProjectDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onProjectCreated={fetchProjects}
        />

        {selectedProject && (
          <EditProjectDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            project={selectedProject}
            onProjectUpdated={fetchProjects}
          />
        )}
      </DashboardLayout>
    </ProtectedRoute>
  )
}
