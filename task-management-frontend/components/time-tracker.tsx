"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Square, Clock } from "lucide-react"
import { apiClient, type TimeEntry } from "@/lib/api"

interface TimeTrackerProps {
  taskId: string
  userId: string
}

export default function TimeTracker({ taskId, userId }: TimeTrackerProps) {
  const [isTracking, setIsTracking] = useState(false)
  const [currentSession, setCurrentSession] = useState<number>(0)
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [totalTime, setTotalTime] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchTimeEntries = useCallback(async () => {
    try {
      const entries = await apiClient.getTaskTimeEntries(taskId)
      setTimeEntries(entries)
      setTotalTime(entries.reduce((sum, entry) => sum + entry.duration, 0))
    } catch (error) {
      console.error("Failed to fetch time entries:", error)
    }
  }, [taskId])

  useEffect(() => {
    fetchTimeEntries()
  }, [taskId, fetchTimeEntries])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTracking) {
      interval = setInterval(() => {
        setCurrentSession((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTracking])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const startTracking = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.startTimeTracking(taskId, userId)
      setSessionId(response.sessionId)
      setIsTracking(true)
      setCurrentSession(0)
    } catch (error) {
      console.error("Failed to start time tracking:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const pauseTracking = () => {
    setIsTracking(false)
  }

  const stopTracking = async () => {
    if (!sessionId) return

    setIsLoading(true)
    try {
      await apiClient.stopTimeTracking(taskId, sessionId, userId)
      setIsTracking(false)
      setCurrentSession(0)
      setSessionId(null)
      await fetchTimeEntries()
    } catch (error) {
      console.error("Failed to stop time tracking:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Time Tracking</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Session */}
        <div className="text-center">
          <div className="text-3xl font-mono font-bold text-blue-600">{formatTime(currentSession)}</div>
          <p className="text-sm text-gray-600">Current session</p>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-2">
          {!isTracking ? (
            <Button onClick={startTracking} size="sm" disabled={isLoading}>
              <Play className="h-4 w-4 mr-2" />
              {isLoading ? "Starting..." : "Start"}
            </Button>
          ) : (
            <>
              <Button onClick={pauseTracking} variant="outline" size="sm" disabled={isLoading}>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
              <Button onClick={stopTracking} variant="destructive" size="sm" disabled={isLoading}>
                <Square className="h-4 w-4 mr-2" />
                {isLoading ? "Stopping..." : "Stop"}
              </Button>
            </>
          )}
        </div>

        {/* Total Time */}
        <div className="text-center pt-4 border-t">
          <div className="text-lg font-semibold">{formatTime(totalTime)}</div>
          <p className="text-sm text-gray-600">Total time logged</p>
        </div>

        {/* Recent Entries */}
        {timeEntries.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recent entries</h4>
            {timeEntries.slice(0, 3).map((entry) => (
              <div key={entry._id} className="flex justify-between items-center text-sm">
                <span>{new Date(entry.startTime).toLocaleDateString()}</span>
                <Badge variant="outline">{formatTime(entry.duration)}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
