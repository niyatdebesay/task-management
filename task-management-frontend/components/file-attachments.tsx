"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, File, Download, Trash2, ImageIcon, FileText } from "lucide-react"
import { apiClient, type FileAttachment } from "@/lib/api"

interface FileAttachmentsProps {
  taskId: string
  onAttachmentsUpdate: () => void
}

export default function FileAttachments({ taskId, onAttachmentsUpdate }: FileAttachmentsProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [attachments, setAttachments] = useState<FileAttachment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchAttachments()
  }, [taskId])

  const fetchAttachments = async () => {
    try {
      const data = await apiClient.getTaskFiles(taskId)
      setAttachments(data)
    } catch (error) {
      console.error("Failed to fetch attachments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return <ImageIcon className="h-4 w-4 text-blue-600" />
    }
    return <FileText className="h-4 w-4 text-gray-600" />
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("taskId", taskId)

        await apiClient.uploadTaskFile(formData)
      }
      await fetchAttachments()
      onAttachmentsUpdate()
    } catch (error) {
      console.error("Failed to upload files:", error)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDownload = async (attachment: FileAttachment) => {
    try {
      window.open(attachment.downloadUrl, "_blank")
    } catch (error) {
      console.error("Failed to download file:", error)
    }
  }

  const handleDelete = async (attachmentId: string) => {
    try {
      await apiClient.deleteTaskFile(attachmentId)
      await fetchAttachments()
      onAttachmentsUpdate()
    } catch (error) {
      console.error("Failed to delete file:", error)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <File className="h-5 w-5" />
            <span>Attachments</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <File className="h-5 w-5" />
            <span>Attachments</span>
            <Badge variant="secondary">{attachments.length}</Badge>
          </CardTitle>
          <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileUpload} />

        {attachments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <File className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">No attachments yet</p>
            <p className="text-xs">Upload files to share with your team</p>
          </div>
        ) : (
          <div className="space-y-3">
            {attachments.map((attachment) => (
              <div key={attachment._id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getFileIcon(attachment.mimeType)}
                  <div>
                    <p className="text-sm font-medium truncate max-w-48">{attachment.originalName}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(attachment.fileSize)} • Uploaded by {attachment.uploadedBy.username} •{" "}
                      {new Date(attachment.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleDownload(attachment)}>
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(attachment._id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
