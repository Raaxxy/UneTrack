"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useAssetContext } from "@/lib/asset-context"

export default function CreateServiceSchemePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const assetId = searchParams.get("assetId")
  const masterAssetId = searchParams.get("masterAssetId")

  const { assets, masterAssets, maintenanceSchedules, addMaintenanceSchedule } = useAssetContext()

  const [name, setName] = useState("")
  const [serviceType, setServiceType] = useState("")
  const [intervalValue, setIntervalValue] = useState("1")
  const [intervalUnit, setIntervalUnit] = useState<"hour" | "day" | "week" | "month" | "year">("month")

  // Get asset or master asset details
  const asset = assetId ? assets.find((a) => a.id === assetId) : null
  const masterAsset = masterAssetId
    ? masterAssets.find((ma) => ma.id === masterAssetId)
    : asset
      ? masterAssets.find((ma) => ma.id === asset.masterAssetId)
      : null

  useEffect(() => {
    // Pre-populate name if we have a master asset
    if (masterAsset) {
      setName(`${masterAsset.name} Maintenance`)
    }
  }, [masterAsset])

  const handleSave = () => {
    if (!name || !serviceType || !intervalValue) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Create new maintenance schedule
    const newSchedule = {
      id: Date.now().toString(),
      name,
      serviceType,
      intervalValue: Number.parseInt(intervalValue),
      intervalUnit,
    }

    addMaintenanceSchedule(newSchedule)

    toast({
      title: "Service Scheme Created",
      description: "The service scheme template has been created successfully",
    })

    // Navigate back
    if (assetId) {
      router.push(`/assets/${assetId}`)
    } else if (masterAssetId) {
      router.push(`/asset-categories`)
    } else {
      router.push("/")
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <div className="flex items-center mb-8">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Create Service Scheme Template</h1>
      </div>

      {masterAsset && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>For Asset: {masterAsset.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Manufacturer</p>
                <p>{masterAsset.manufacturer || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Model</p>
                <p>{masterAsset.modelNumber || "Not specified"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Service Scheme Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="name">Scheme Name*</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter service scheme name"
            />
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="serviceType">Service Type*</Label>
            <Input
              id="serviceType"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              placeholder="E.g., Cleaning, Inspection, Calibration"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="intervalValue">Interval Value*</Label>
              <Input
                id="intervalValue"
                type="number"
                min="1"
                value={intervalValue}
                onChange={(e) => setIntervalValue(e.target.value)}
              />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="intervalUnit">Interval Unit*</Label>
              <Select
                value={intervalUnit}
                onValueChange={(value: "hour" | "day" | "week" | "month" | "year") => setIntervalUnit(value)}
              >
                <SelectTrigger id="intervalUnit">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hour">Hour</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="outline" onClick={() => router.back()} className="mr-2">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Service Scheme
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
