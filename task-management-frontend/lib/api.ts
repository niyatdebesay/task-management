const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005"

export interface User {
  _id: string
  username: string
  email: string
  role: string
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  email: string
  password: string
  inviteToken?: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  inviteToken?: string
}

export interface AuthResponse {
  _id: string
  username: string
  email: string
  role: string
  createdAt: string
  updatedAt: string
  token: string
}

export interface Project {
  _id: string
  name: string
  description?: string
  creator: string
  teamMembers: User[]
  tasks: Task[]
  priority?: "LOW" | "MEDIUM" | "HIGH"
  deadline?: string
  createdAt: string
  updatedAt: string
}

export interface Task {
  _id: string
  title: string
  description?: string
  assignedTo: User[]
  status: "To Do" | "In Progress" | "Completed"
  priority?: "LOW" | "MEDIUM" | "HIGH"
  deadline?: string
  project: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface CreateProjectRequest {
  name: string
  description?: string
  owner: string
  deadline?: string
}

export interface UpdateProjectRequest {
  name?: string
  description?: string
  priority?: "LOW" | "MEDIUM" | "HIGH"
  deadline?: string
}

export interface CreateTaskRequest {
  title: string
  description?: string
  assignedTo?: string[]
  status?: "To Do" | "In Progress" | "Completed"
  deadline?: Date
  createdBy: string
  project: string
  priority?: "LOW" | "MEDIUM" | "HIGH"
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  assignedTo?: string[]
  status?: "To Do" | "In Progress" | "Completed"
  priority?: "LOW" | "MEDIUM" | "HIGH"
  deadline?: Date
  project?: string
}

export interface TimeEntry {
  _id: string
  taskId: string
  userId: string
  startTime: string
  endTime?: string
  duration: number
  description?: string
}

export interface Comment {
  _id: string
  content: string
  author: {
    _id: string
    username: string
    email: string
  }
  createdAt: string
  updatedAt: string
  mentions?: string[]
}

export interface FileAttachment {
  _id: string
  fileName: string
  originalName: string
  fileSize: number
  mimeType: string
  uploadedBy: {
    _id: string
    username: string
  }
  uploadedAt: string
  downloadUrl: string
}

export interface Activity {
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

export interface ProjectAnalytics {
  taskStats: {
    total: number
    completed: number
    inProgress: number
    todo: number
    overdue: number
  }
  priorityBreakdown: {
    high: number
    medium: number
    low: number
  }
  teamProductivity: {
    userId: string
    username: string
    tasksCompleted: number
    tasksInProgress: number
    averageCompletionTime: number
  }[]
  timeTracking: {
    totalHours: number
    thisWeekHours: number
    averageTaskTime: number
  }
  completionTrend: {
    date: string
    completed: number
  }[]
}

class ApiClient {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem("token")
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Login failed")
    }

    return response.json()
  }

  async register(data: RegisterRequest): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/user/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Registration failed")
    }

    return response.json()
  }

  async getUser(id: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/user/${id}`, {
      headers: {
        ...this.getAuthHeaders(),
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch user")
    }

    return response.json()
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/user/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to update user")
    }

    return response.json()
  }

  async getUserProjects(userId: string): Promise<{ ownedProjects: Project[]; userProjects: Project[] }> {
    const response = await fetch(`${API_BASE_URL}/project/${userId}/projects`, {
      headers: {
        ...this.getAuthHeaders(),
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch projects")
    }

    return response.json()
  }

  async createProject(data: CreateProjectRequest): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/project/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to create project")
    }

    return response.json()
  }

  async updateProject(projectId: string, data: UpdateProjectRequest): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/project/${projectId}/edit`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to update project")
    }

    return response.json()
  }

  async deleteProject(projectId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/project/${projectId}`, {
      method: "DELETE",
      headers: {
        ...this.getAuthHeaders(),
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to delete project")
    }

    return response.json()
  }

  async addUsersToProject(projectId: string, userIds: string[]): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/project/${projectId}/addUsers`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ userIds }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to add users to project")
    }

    return response.json()
  }

  async removeUserFromProject(projectId: string, userId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/project/${projectId}/user/${userId}`, {
      method: "DELETE",
      headers: {
        ...this.getAuthHeaders(),
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to remove user from project")
    }

    return response.json()
  }

  async changeProjectPriority(projectId: string, priority: "LOW" | "MEDIUM" | "HIGH"): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/project/${projectId}/changePriority`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ priority }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to change project priority")
    }

    return response.json()
  }

  async getProject(id: string): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/project/${id}`, {
      headers: {
        ...this.getAuthHeaders(),
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch project")
    }

    return response.json()
  }

  async getProjectTasks(projectId: string): Promise<Task[]> {
    const response = await fetch(`${API_BASE_URL}/project/${projectId}/tasks`, {
      headers: {
        ...this.getAuthHeaders(),
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch project tasks")
    }

    return response.json()
  }

  async createTask(data: CreateTaskRequest): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/task/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to create task")
    }

    return response.json()
  }

  async getTask(taskId: string): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/task/${taskId}`, {
      headers: {
        ...this.getAuthHeaders(),
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch task")
    }

    return response.json()
  }

  async updateTask(id: string, data: UpdateTaskRequest): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/task/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to update task")
    }

    return response.json()
  }

  async assignTaskToUser(taskId: string, userId: string): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/task/assign/${taskId}/${userId}`, {
      method: "PATCH",
      headers: {
        ...this.getAuthHeaders(),
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to assign task")
    }

    return response.json()
  }

  async removeUserFromTask(taskId: string, userId: string): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/task/removeUser/${taskId}/${userId}`, {
      method: "DELETE",
      headers: {
        ...this.getAuthHeaders(),
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to remove user from task")
    }

    return response.json()
  }

  async updateTaskPriority(taskId: string, priority: "LOW" | "MEDIUM" | "HIGH"): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/task/priority/${taskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ priority }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to update task priority")
    }

    return response.json()
  }

  async updateTaskDeadline(taskId: string, deadline: Date): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/task/deadline/${taskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ deadline }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to update task deadline")
    }

    return response.json()
  }

  async updateTaskStatus(taskId: string, status: "To Do" | "In Progress" | "Completed"): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/task/status/${taskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to update task status")
    }

    return response.json()
  }

  async deleteTask(taskId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/task/${taskId}`, {
      method: "DELETE",
      headers: {
        ...this.getAuthHeaders(),
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to delete task")
    }

    return response.json()
  }

  async inviteUserToProject(projectId: string, email: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/project/${projectId}/inviteUser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to send invitation")
    }

    return response.json()
  }

  async getUserTasks(userId: string): Promise<Task[]> {
    const response = await fetch(`${API_BASE_URL}/task/${userId}/user`, {
      headers: {
        ...this.getAuthHeaders(),
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch user tasks")
    }

    return response.json()
  }

  // Time Tracking APIs
  async startTimeTracking(taskId: string, userId: string): Promise<{ sessionId: string; startTime: string }> {
    const response = await fetch(`${API_BASE_URL}/task/${taskId}/time/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ userId }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to start time tracking")
    }

    return response.json()
  }

  async stopTimeTracking(taskId: string, sessionId: string, userId: string): Promise<TimeEntry> {
    const response = await fetch(`${API_BASE_URL}/task/${taskId}/time/stop`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ sessionId, userId }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to stop time tracking")
    }

    return response.json()
  }

  async getTaskTimeEntries(taskId: string): Promise<TimeEntry[]> {
    const response = await fetch(`${API_BASE_URL}/task/${taskId}/time`, {
      headers: {
        ...this.getAuthHeaders(),
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch time entries")
    }

    return response.json()
  }

  // Comments APIs
  async addTaskComment(taskId: string, content: string): Promise<Comment> {
    const response = await fetch(`${API_BASE_URL}/task/${taskId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ content }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to add comment")
    }

    return response.json()
  }

  async getTaskComments(taskId: string): Promise<Comment[]> {
    const response = await fetch(`${API_BASE_URL}/task/${taskId}/comments`, {
      headers: {
        ...this.getAuthHeaders(),
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch comments")
    }

    return response.json()
  }

  // File Attachments APIs
  async uploadTaskFile(formData: FormData): Promise<FileAttachment> {
    const response = await fetch(`${API_BASE_URL}/task/files/upload`, {
      method: "POST",
      headers: {
        ...this.getAuthHeaders(),
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to upload file")
    }

    return response.json()
  }

  async getTaskFiles(taskId: string): Promise<FileAttachment[]> {
    const response = await fetch(`${API_BASE_URL}/task/${taskId}/files`, {
      headers: {
        ...this.getAuthHeaders(),
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch files")
    }

    return response.json()
  }

  async deleteTaskFile(fileId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
      method: "DELETE",
      headers: {
        ...this.getAuthHeaders(),
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to delete file")
    }

    return response.json()
  }

  // Activity Feed APIs
  async getProjectActivities(projectId: string): Promise<Activity[]> {
    const response = await fetch(`${API_BASE_URL}/project/${projectId}/activities`, {
      headers: {
        ...this.getAuthHeaders(),
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch activities")
    }

    return response.json()
  }

  // Analytics APIs
  async getProjectAnalytics(projectId: string): Promise<ProjectAnalytics> {
    const response = await fetch(`${API_BASE_URL}/project/${projectId}/analytics`, {
      headers: {
        ...this.getAuthHeaders(),
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch analytics")
    }

    return response.json()
  }
}

export const apiClient = new ApiClient()
