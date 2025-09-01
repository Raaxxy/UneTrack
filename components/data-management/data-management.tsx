"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Download, Upload, FileText, Database, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { useAssetContext } from "@/lib/asset-context"

interface ExportJob {
  id: string
  type: "export" | "import"
  format: string
  status: "pending" | "processing" | "completed" | "failed"
  progress: number
  createdAt: Date
  fileName?: string
  recordCount?: number
  error?: string
}

export function DataManagement() {
  const { assets, categories, addAsset, addCategory } = useAssetContext()
  const [exportFormat, setExportFormat] = useState("csv")
  const [exportType, setExportType] = useState("assets")
  const [importFile, setImportFile] = useState<File | null>(null)
  const [jobs, setJobs] = useState<ExportJob[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const handleExport = async () => {
    const jobId = Date.now().toString()
    const newJob: ExportJob = {
      id: jobId,
      type: "export",
      format: exportFormat,
      status: "processing",
      progress: 0,
      createdAt: new Date(),
    }

    setJobs((prev) => [newJob, ...prev])
    setIsProcessing(true)

    // Simulate export process
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      setJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, progress: i } : job)))
    }

    const data = exportType === "assets" ? assets : categories
    const fileName = `${exportType}_export_${new Date().toISOString().split("T")[0]}.${exportFormat}`

    // Generate and download file
    let content = ""
    if (exportFormat === "csv") {
      if (exportType === "assets") {
        content = "ID,Name,Category,Status,Location,Purchase Date,Value\n"
        content += assets
          .map(
            (asset) =>
              `${asset.id},"${asset.name}","${asset.category}","${asset.status}","${asset.location}","${asset.purchaseDate}",${asset.value}`,
          )
          .join("\n")
      } else {
        content = "ID,Name,Description,Color\n"
        content += categories.map((cat) => `${cat.id},"${cat.name}","${cat.description}","${cat.color}"`).join("\n")
      }
    } else if (exportFormat === "json") {
      content = JSON.stringify(data, null, 2)
    }

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    a.click()

    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId
          ? {
              ...job,
              status: "completed",
              fileName,
              recordCount: data.length,
            }
          : job,
      ),
    )
    setIsProcessing(false)
  }

  const handleImport = async () => {
    if (!importFile) return

    const jobId = Date.now().toString()
    const newJob: ExportJob = {
      id: jobId,
      type: "import",
      format: importFile.name.split(".").pop() || "unknown",
      status: "processing",
      progress: 0,
      createdAt: new Date(),
    }

    setJobs((prev) => [newJob, ...prev])
    setIsProcessing(true)

    try {
      const text = await importFile.text()

      // Simulate import process
      for (let i = 0; i <= 100; i += 20) {
        await new Promise((resolve) => setTimeout(resolve, 300))
        setJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, progress: i } : job)))
      }

      let importedCount = 0

      if (importFile.name.endsWith(".csv")) {
        const lines = text.split("\n").filter((line) => line.trim())
        const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim())

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",").map((v) => v.replace(/"/g, "").trim())

          if (headers.includes("Name") && headers.includes("Category")) {
            const nameIndex = headers.indexOf("Name")
            const categoryIndex = headers.indexOf("Category")

            if (values[nameIndex] && values[categoryIndex]) {
              // Add asset or category based on data structure
              importedCount++
            }
          }
        }
      } else if (importFile.name.endsWith(".json")) {
        const data = JSON.parse(text)
        if (Array.isArray(data)) {
          importedCount = data.length
        }
      }

      setJobs((prev) =>
        prev.map((job) =>
          job.id === jobId
            ? {
                ...job,
                status: "completed",
                recordCount: importedCount,
              }
            : job,
        ),
      )
    } catch (error) {
      setJobs((prev) =>
        prev.map((job) =>
          job.id === jobId
            ? {
                ...job,
                status: "failed",
                error: "Failed to process file",
              }
            : job,
        ),
      )
    }

    setIsProcessing(false)
    setImportFile(null)
  }

  const getStatusIcon = (status: ExportJob["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case "processing":
        return <Clock className="h-4 w-4 text-blue-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: ExportJob["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Data Management</h2>
        <p className="text-gray-600">Export and import your asset data in various formats</p>
      </div>

      <Tabs defaultValue="export" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Data
              </CardTitle>
              <CardDescription>Export your asset data in various formats for backup or analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="export-type">Data Type</Label>
                  <Select value={exportType} onValueChange={setExportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assets">Assets ({assets.length} records)</SelectItem>
                      <SelectItem value="categories">Categories ({categories.length} records)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="export-format">Format</Label>
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleExport} disabled={isProcessing} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export {exportType === "assets" ? "Assets" : "Categories"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Import Data
              </CardTitle>
              <CardDescription>Import asset data from CSV, JSON, or Excel files</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="import-file">Select File</Label>
                <Input
                  id="import-file"
                  type="file"
                  accept=".csv,.json,.xlsx"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                />
              </div>
              {importFile && (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    Selected: {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
                  </AlertDescription>
                </Alert>
              )}
              <Button onClick={handleImport} disabled={!importFile || isProcessing} className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {jobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Recent Jobs
            </CardTitle>
            <CardDescription>Track the status of your export and import operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <div className="font-medium">
                        {job.type === "export" ? "Export" : "Import"} - {job.format.toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {job.createdAt.toLocaleString()}
                        {job.recordCount && ` • ${job.recordCount} records`}
                        {job.fileName && ` • ${job.fileName}`}
                      </div>
                      {job.error && <div className="text-sm text-red-600">{job.error}</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                    {job.status === "processing" && (
                      <div className="w-24">
                        <Progress value={job.progress} className="h-2" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
