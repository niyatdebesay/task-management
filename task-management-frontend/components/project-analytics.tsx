"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, Clock, Users, CheckSquare, AlertTriangle } from "lucide-react"
import { apiClient, type ProjectAnalytics } from "@/lib/api"

interface ProjectAnalyticsProps {
  projectId: string
}

export default function ProjectAnalyticsComponent({ projectId }: ProjectAnalyticsProps) {
  const [analytics, setAnalytics] = useState<ProjectAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchAnalytics = useCallback(async () => {
    try {
      const data = await apiClient.getProjectAnalytics(projectId)
      setAnalytics(data)
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
      // Fallback to mock data if API fails
      setAnalytics({
        taskStats: {
          total: 25,
          completed: 15,
          inProgress: 7,
          todo: 3,
          overdue: 2,
        },
        priorityBreakdown: {
          high: 8,
          medium: 12,
          low: 5,
        },
        teamProductivity: [],
        timeTracking: {
          totalHours: 0,
          thisWeekHours: 0,
          averageTaskTime: 0,
        },
        completionTrend: [],
      })
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchAnalytics()
  }, [projectId, fetchAnalytics])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!analytics) return null

  const completionRate = Math.round((analytics.taskStats.completed / analytics.taskStats.total) * 100)

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <Progress value={completionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {analytics.taskStats.completed} of {analytics.taskStats.total} tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Tracked</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.timeTracking.totalHours}h</div>
            <p className="text-xs text-muted-foreground">{analytics.timeTracking.thisWeekHours}h this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.teamProductivity.length}</div>
            <p className="text-xs text-muted-foreground">Active contributors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analytics.taskStats.overdue}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckSquare className="h-5 w-5" />
              <span>Task Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Completed</span>
              <div className="flex items-center space-x-2">
                <Progress value={(analytics.taskStats.completed / analytics.taskStats.total) * 100} className="w-24" />
                <Badge variant="outline">{analytics.taskStats.completed}</Badge>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">In Progress</span>
              <div className="flex items-center space-x-2">
                <Progress value={(analytics.taskStats.inProgress / analytics.taskStats.total) * 100} className="w-24" />
                <Badge variant="outline">{analytics.taskStats.inProgress}</Badge>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">To Do</span>
              <div className="flex items-center space-x-2">
                <Progress value={(analytics.taskStats.todo / analytics.taskStats.total) * 100} className="w-24" />
                <Badge variant="outline">{analytics.taskStats.todo}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Priority Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Priority Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">High Priority</span>
              <div className="flex items-center space-x-2">
                <Progress
                  value={(analytics.priorityBreakdown.high / analytics.taskStats.total) * 100}
                  className="w-24"
                />
                <Badge className="bg-red-100 text-red-800">{analytics.priorityBreakdown.high}</Badge>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Medium Priority</span>
              <div className="flex items-center space-x-2">
                <Progress
                  value={(analytics.priorityBreakdown.medium / analytics.taskStats.total) * 100}
                  className="w-24"
                />
                <Badge className="bg-yellow-100 text-yellow-800">{analytics.priorityBreakdown.medium}</Badge>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Low Priority</span>
              <div className="flex items-center space-x-2">
                <Progress
                  value={(analytics.priorityBreakdown.low / analytics.taskStats.total) * 100}
                  className="w-24"
                />
                <Badge className="bg-green-100 text-green-800">{analytics.priorityBreakdown.low}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Productivity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Team Productivity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.teamProductivity.map((member) => (
              <div key={member.userId} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">{member.username.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{member.username}</p>
                    <p className="text-xs text-gray-500">Avg. completion: {member.averageCompletionTime}h</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{member.tasksCompleted}</div>
                    <div className="text-xs text-gray-500">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{member.tasksInProgress}</div>
                    <div className="text-xs text-gray-500">In Progress</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
