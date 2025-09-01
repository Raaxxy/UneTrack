"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  SettingsIcon,
  FolderTree,
  FileBarChart,
  Users,
  Wrench,
  Plus,
  Edit,
  Trash2,
  FileText,
  Clock,
} from "lucide-react"
import AssetCategories from "@/components/asset-categories/asset-categories"
import UserManagement from "@/components/users/user-management"
import { useAssetContext } from "@/lib/asset-context"

const CustomReportGenerator = () => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-4">
        <FileBarChart className="h-16 w-16 mx-auto text-muted-foreground/50" />
        <div>
          <h3 className="text-xl font-semibold text-muted-foreground">Coming Soon</h3>
          <p className="text-muted-foreground mt-2">Custom report generator is under development</p>
          <p className="text-sm text-muted-foreground">Advanced reporting features will be available soon</p>
        </div>
      </div>
    </div>
  )
}

const MaintenanceSOP = () => {
  const { categories } = useAssetContext()
  const [sops, setSops] = useState([])

  const [isCreating, setIsCreating] = useState(false)
  const [editingSop, setEditingSop] = useState(null)
  const [newSop, setNewSop] = useState({
    categoryId: "",
    title: "",
    description: "",
    steps: [""],
    frequency: "Weekly",
    estimatedTime: "",
  })

  const addStep = () => {
    setNewSop({
      ...newSop,
      steps: [...newSop.steps, ""],
    })
  }

  const updateStep = (index, value) => {
    const updatedSteps = [...newSop.steps]
    updatedSteps[index] = value
    setNewSop({ ...newSop, steps: updatedSteps })
  }

  const removeStep = (index) => {
    const updatedSteps = newSop.steps.filter((_, i) => i !== index)
    setNewSop({ ...newSop, steps: updatedSteps })
  }

  const saveSop = () => {
    if (newSop.categoryId && newSop.title && newSop.steps.filter((step) => step.trim()).length > 0) {
      const categoryName = categories.find((cat) => cat.id === newSop.categoryId)?.name || "Unknown"
      const sopToSave = {
        id: Date.now(),
        ...newSop,
        categoryName,
        steps: newSop.steps.filter((step) => step.trim()),
        createdAt: new Date().toISOString().split("T")[0],
      }
      setSops([...sops, sopToSave])
      setNewSop({
        categoryId: "",
        title: "",
        description: "",
        steps: [""],
        frequency: "Weekly",
        estimatedTime: "",
      })
      setIsCreating(false)
    }
  }

  const deleteSop = (id) => {
    setSops(sops.filter((sop) => sop.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Maintenance Standard Operating Procedures</h3>
          <p className="text-muted-foreground">Create and manage maintenance SOPs for different asset categories</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create SOP
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Maintenance SOP</CardTitle>
            <CardDescription>Define maintenance procedures for a specific asset category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Asset Category</label>
                <select
                  className="w-full p-2 border rounded-md bg-background"
                  value={newSop.categoryId}
                  onChange={(e) => setNewSop({ ...newSop, categoryId: e.target.value })}
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Frequency</label>
                <select
                  className="w-full p-2 border rounded-md bg-background"
                  value={newSop.frequency}
                  onChange={(e) => setNewSop({ ...newSop, frequency: e.target.value })}
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Annually">Annually</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">SOP Title</label>
              <Input
                placeholder="e.g., Screen Cleaning and Calibration"
                value={newSop.title}
                onChange={(e) => setNewSop({ ...newSop, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Brief description of the maintenance procedure"
                value={newSop.description}
                onChange={(e) => setNewSop({ ...newSop, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Estimated Time</label>
              <Input
                placeholder="e.g., 30 minutes"
                value={newSop.estimatedTime}
                onChange={(e) => setNewSop({ ...newSop, estimatedTime: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Maintenance Steps</label>
                <Button variant="outline" size="sm" onClick={addStep}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add Step
                </Button>
              </div>
              {newSop.steps.map((step, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <Input
                    placeholder={`Step ${index + 1}`}
                    value={step}
                    onChange={(e) => updateStep(index, e.target.value)}
                    className="flex-1"
                  />
                  {newSop.steps.length > 1 && (
                    <Button variant="outline" size="sm" onClick={() => removeStep(index)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={saveSop}>Save SOP</Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {sops.map((sop) => (
          <Card key={sop.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {sop.title}
                  </CardTitle>
                  <CardDescription className="mt-1">{sop.description}</CardDescription>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge variant="secondary">{sop.categoryName}</Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {sop.frequency}
                    </div>
                    <div className="text-sm text-muted-foreground">Est. {sop.estimatedTime}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => deleteSop(sop.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Maintenance Steps:</h4>
                <ol className="space-y-1">
                  {sops.steps.map((step, index) => (
                    <li key={index} className="flex gap-3 text-sm">
                      <span className="flex-shrink-0 w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function Settings() {
  const { categories, setCategories, assets } = useAssetContext()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage system configuration and administrative settings</p>
        </div>
      </div>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <FolderTree className="h-4 w-4" />
            Asset Categories
          </TabsTrigger>
          <TabsTrigger value="maintenance-sop" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Maintenance SOP
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileBarChart className="h-4 w-4" />
            Custom Reports
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Asset Categories Management</CardTitle>
              <CardDescription>Create and manage asset categories for better organization</CardDescription>
            </CardHeader>
            <CardContent>
              <AssetCategories categories={categories} setCategories={setCategories} assets={assets} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance-sop" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Standard Operating Procedures</CardTitle>
              <CardDescription>Create and manage maintenance SOPs for different asset categories</CardDescription>
            </CardHeader>
            <CardContent>
              <MaintenanceSOP />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom Report Configuration</CardTitle>
              <CardDescription>Generate customized reports with specific parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <CustomReportGenerator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management & Permissions</CardTitle>
              <CardDescription>Manage users, roles, and system permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
