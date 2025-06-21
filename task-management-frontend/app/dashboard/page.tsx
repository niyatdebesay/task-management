"use client"

import { useEffect, useState, useCallback } from "react"
import ProtectedRoute from "@/components/protected-route"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckSquare, Clock, AlertCircle, Users, Calendar, ArrowRight } from "lucide-react"
import { apiClient, type Task, type Project } from "@/lib/api"
import Link from "next/link"

export default function DashboardPage() {
  const { user } = useAuth()
  const [userTasks, setUserTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<{ ownedProjects: Project[]; userProjects: Project[] }>({
    ownedProjects: [],
    userProjects: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  // Move fetchDashboardData above useEffect
  const fetchDashboardData = useCallback(async () => {
    try {
      const [tasksData, projectsData] = await Promise.all([
        apiClient.getUserTasks(user!._id),
        apiClient.getUserProjects(user!._id),
      ])
      setUserTasks(tasksData)
      setProjects(projectsData)
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user, fetchDashboardData])

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800"
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800"
      case "LOW":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTaskStats = () => {
    const total = userTasks.length
    const completed = userTasks.filter((task) => task.status === "Completed").length
    const inProgress = userTasks.filter((task) => task.status === "In Progress").length
    const overdue = userTasks.filter(
      (task) => task.deadline && new Date(task.deadline) < new Date() && task.status !== "Completed",
    ).length

    return { total, completed, inProgress, overdue }
  }

  // Deduplicate projects properly
  const getUniqueProjects = () => {
    const allProjects = [...projects.ownedProjects, ...projects.userProjects]
    const uniqueProjects = allProjects.filter(
      (project, index, self) => index === self.findIndex((p) => p._id === project._id),
    )
    return uniqueProjects
  }

  const stats = getTaskStats()
  const uniqueProjects = getUniqueProjects()
  const recentTasks = userTasks.slice(0, 5)

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

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.username}!</h1>
            <p className="mt-2 text-gray-600">Here&#39;s what&apos;s happening with your tasks today.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Across {uniqueProjects.length} projects</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.inProgress}</div>
                <p className="text-xs text-muted-foreground">Currently active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completed}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% completion rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
                <p className="text-xs text-muted-foreground">Need attention</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Tasks */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Tasks</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/tasks">
                      View all
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <CardDescription>Your latest task assignments</CardDescription>
              </CardHeader>
              <CardContent>
                {recentTasks.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No tasks assigned to you yet.</p>
                ) : (
                  <div className="space-y-3">
                    {recentTasks.map((task) => (
                      <Link key={task._id} href={`/projects/${task.project}`}>
                        <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {task.status}
                              </Badge>
                              {task.priority && (
                                <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>{task.priority}</Badge>
                              )}
                              {task.deadline && (
                                <span className="text-xs text-gray-500 flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {new Date(task.deadline).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Projects Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Your Projects</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/projects">
                      View all
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <CardDescription>Recent project activity</CardDescription>
              </CardHeader>
              <CardContent>
                {uniqueProjects.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">No projects yet.</p>
                    <Button asChild>
                      <Link href="/projects">Create your first project</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {uniqueProjects.slice(0, 5).map((project) => (
                      <Link key={`dashboard-project-${project._id}`} href={`/projects/${project._id}`}>
                        <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{project.name}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="flex items-center space-x-1">
                                <Users className="h-3 w-3 text-gray-500" />
                                <span className="text-xs text-gray-600">{project.teamMembers?.length || 0}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <CheckSquare className="h-3 w-3 text-gray-500" />
                                <span className="text-xs text-gray-600">{project.tasks?.length || 0} tasks</span>
                              </div>
                              {project.priority && (
                                <Badge className={`text-xs ${getPriorityColor(project.priority)}`}>
                                  {project.priority}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
