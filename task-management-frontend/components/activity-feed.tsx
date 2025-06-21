"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Clock, MessageSquare, UserPlus, CheckSquare, AlertCircle, FileText } from "lucide-react"

interface Activity {
  _id: string
  type: "task_created" | "task_updated" | "task_completed" | "user_added" | "comment_added" | "file_uploaded"
  user: {
    _id: string
    username: string
    email: string
  }
  description: string
  metadata?: {
    taskTitle?: string
    taskId?: string
    projectName?: string
    fileName?: string
  }
  createdAt: string
}

interface ActivityFeedProps {
  projectId: string
}

export default function ActivityFeed({ projectId }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
  }, [projectId])

  const fetchActivities = async () => {
    try {
      // This endpoint needs to be implemented in your backend
      // const response = await apiClient.getProjectActivities(projectId)
      // setActivities(response)

      // Mock data for now
      setActivities([
        {
          _id: "1",
          type: "task_created",
          user: { _id: "1", username: "john_doe", email: "john@example.com" },
          description: "created a new task",
          metadata: { taskTitle: "Implement user authentication", taskId: "task1" },
          createdAt: new Date().toISOString(),
        },
      ])
    } catch (error) {
      console.error("Failed to fetch activities:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "task_created":
      case "task_updated":
        return <CheckSquare className="h-4 w-4 text-blue-600" />
      case "task_completed":
        return <CheckSquare className="h-4 w-4 text-green-600" />
      case "user_added":
        return <UserPlus className="h-4 w-4 text-purple-600" />
      case "comment_added":
        return <MessageSquare className="h-4 w-4 text-orange-600" />
      case "file_uploaded":
        return <FileText className="h-4 w-4 text-gray-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No recent activity</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity._id} className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {activity.user.username?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    {getActivityIcon(activity.type)}
                    <p className="text-sm">
                      <span className="font-medium">{activity.user.username}</span> {activity.description}
                      {activity.metadata?.taskTitle && (
                        <span className="font-medium"> {activity.metadata.taskTitle}</span>
                      )}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(activity.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
