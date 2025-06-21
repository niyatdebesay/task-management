"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import ProtectedRoute from "@/components/protected-route"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { User, Calendar, Shield, Edit2, Save, X } from "lucide-react"
import { apiClient } from "@/lib/api"

export default function ProfilePage() {
  const { user, login } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (user) {
      setUsername(user.username)
      setEmail(user.email)
    }
  }, [user])

  const handleSave = async () => {
    if (!user) return

    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      const updatedUser = await apiClient.updateUser(user._id, {
        username,
        email,
      })

      // Update the auth context with new user data
      const token = localStorage.getItem("token")
      if (token) {
        login(updatedUser, token)
      }

      setSuccess("Profile updated successfully!")
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setUsername(user.username)
      setEmail(user.email)
    }
    setIsEditing(false)
    setError("")
    setSuccess("")
  }

  if (!user) return null

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="mt-2 text-gray-600">Manage your account information and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarFallback className="text-2xl">
                      {user.username?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-xl">{user.username}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                  <Badge variant="outline" className="mt-2">
                    <Shield className="h-3 w-3 mr-1" />
                    {user.role}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Member since {new Date(user.createdAt).getFullYear()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Account Information */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Account Information</CardTitle>
                      <CardDescription>Update your personal information</CardDescription>
                    </div>
                    {!isEditing ? (
                      <Button variant="outline" onClick={() => setIsEditing(true)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex space-x-2">
                        <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isLoading}>
                          <Save className="h-4 w-4 mr-2" />
                          {isLoading ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert>
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={!isEditing || isLoading}
                        className={!isEditing ? "bg-gray-50" : ""}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={!isEditing || isLoading}
                        className={!isEditing ? "bg-gray-50" : ""}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Account Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">User ID:</span>
                        <p className="text-gray-600 font-mono">{user._id}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Account Type:</span>
                        <p className="text-gray-600">{user.role}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Created:</span>
                        <p className="text-gray-600">{new Date(user.createdAt).toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Last Updated:</span>
                        <p className="text-gray-600">{new Date(user.updatedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
