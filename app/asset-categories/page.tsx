"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Info, Plus, Wrench, Eye } from "lucide-react"
import { useAssetContext } from "@/lib/asset-context"

export default function AssetCategoriesPage() {
  const router = useRouter()
  const { categories, masterAssets, maintenanceSchedules } = useAssetContext()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedMasterAsset, setSelectedMasterAsset] = useState<string | null>(null)

  // Filter master assets by category if a category is selected
  const filteredMasterAssets = selectedCategory
    ? masterAssets.filter((asset) => asset.categoryId === selectedCategory)
    : masterAssets

  // Get the selected master asset details
  const masterAssetDetails = selectedMasterAsset ? masterAssets.find((asset) => asset.id === selectedMasterAsset) : null

  // Check if master asset has service scheme template
  const hasServiceScheme = masterAssetDetails
    ? maintenanceSchedules.some((schedule) => schedule.id === masterAssetDetails.maintenanceScheduleId)
    : false

  const handleViewCategory = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setSelectedMasterAsset(null)
  }

  const handleViewMasterAsset = (assetId: string) => {
    setSelectedMasterAsset(assetId)
  }

  const handleCreateServiceScheme = () => {
    if (selectedMasterAsset) {
      router.push(`/service-schemes/create?masterAssetId=${selectedMasterAsset}`)
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 sm:px-10">
      <h1 className="text-3xl font-bold mb-8">Asset Categories & Master Assets</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Asset Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => handleViewCategory(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selectedCategory ? (
            <Card>
              <CardHeader>
                <CardTitle>{categories.find((c) => c.id === selectedCategory)?.name} - Master Assets</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredMasterAssets.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset Name</TableHead>
                        <TableHead>Manufacturer</TableHead>
                        <TableHead>Model Number</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMasterAssets.map((asset) => (
                        <TableRow key={asset.id}>
                          <TableCell className="font-medium">{asset.name}</TableCell>
                          <TableCell>{asset.manufacturer}</TableCell>
                          <TableCell>{asset.modelNumber}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewMasterAsset(asset.id)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No master assets found in this category.</div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Select a category to view master assets</p>
            </div>
          )}

          {selectedMasterAsset && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Master Asset Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="details">
                  <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="service">Service Scheme</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="pt-4">
                    {masterAssetDetails && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Asset Name</h3>
                          <p className="text-lg font-semibold">{masterAssetDetails.name}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
                          <p className="text-lg">
                            {categories.find((c) => c.id === masterAssetDetails.categoryId)?.name}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Manufacturer</h3>
                          <p className="text-lg">{masterAssetDetails.manufacturer || "Not specified"}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Model Number</h3>
                          <p className="text-lg">{masterAssetDetails.modelNumber || "Not specified"}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Estimated Maintenance Time</h3>
                          <p className="text-lg">{masterAssetDetails.estimatedMaintenanceTime} minutes</p>
                        </div>
                        <div className="md:col-span-2">
                          <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                          <p className="text-lg">{masterAssetDetails.description || "No description provided"}</p>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="service" className="pt-4">
                    {hasServiceScheme ? (
                      <div>
                        <Card className="overflow-hidden border-none shadow-md">
                          <div className="bg-green-500 h-2"></div>
                          <CardHeader className="pb-2 pt-6">
                            <CardTitle className="text-xl flex items-center">
                              <Wrench className="h-5 w-5 mr-2 text-green-500" />
                              Service Scheme Details
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-6 pb-6">
                            {masterAssetDetails && masterAssetDetails.maintenanceScheduleId && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {maintenanceSchedules
                                  .filter((schedule) => schedule.id === masterAssetDetails.maintenanceScheduleId)
                                  .map((schedule) => (
                                    <div key={schedule.id} className="md:col-span-2">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                          <h3 className="text-sm font-medium text-muted-foreground">Scheme Name</h3>
                                          <p className="text-lg font-semibold">{schedule.name}</p>
                                        </div>
                                        <div>
                                          <h3 className="text-sm font-medium text-muted-foreground">Service Type</h3>
                                          <p className="text-lg">{schedule.serviceType}</p>
                                        </div>
                                        <div>
                                          <h3 className="text-sm font-medium text-muted-foreground">Interval</h3>
                                          <p className="text-lg">
                                            {schedule.intervalValue} {schedule.intervalUnit}
                                            {schedule.intervalValue > 1 ? "s" : ""}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <Alert variant="warning" className="bg-amber-50 border-amber-200">
                          <AlertTitle className="text-amber-800 flex items-center gap-2">
                            <Info className="h-5 w-5" />
                            No Service Scheme
                          </AlertTitle>
                          <AlertDescription className="text-amber-700">
                            This master asset doesn't have a service scheme template yet. Create a service scheme
                            template to standardize maintenance.
                          </AlertDescription>
                        </Alert>

                        <div className="flex justify-center">
                          <Button onClick={handleCreateServiceScheme} className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Create Service Scheme Template
                          </Button>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
