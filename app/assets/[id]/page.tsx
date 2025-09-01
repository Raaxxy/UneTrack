"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, MapPin, Info, Printer, Monitor } from "lucide-react"
import { format } from "date-fns"
import type { Asset } from "@/lib/types"
import { useAssetContext } from "@/lib/asset-context"

interface AssetDetailPageProps {
  params: {
    id: string
  }
}

export default function AssetDetailPage({ params }: AssetDetailPageProps) {
  const router = useRouter()
  const { assets, categories } = useAssetContext()
  const [asset, setAsset] = useState<Asset | null>(null)

  useEffect(() => {
    const foundAsset = assets.find((a) => a.id === params.id)
    if (foundAsset) {
      const enhancedAsset = {
        ...foundAsset,
        name: foundAsset.name || 'Samsung 55" 4K Digital Display',
        manufacturer: foundAsset.manufacturer || "Samsung",
        modelNumber: foundAsset.modelNumber || "QM55R-T",
        screenSize: foundAsset.screenSize || "55 inch",
        customScreenSize: foundAsset.customScreenSize || 55,
        resolution: foundAsset.resolution || "4K (3840x2160)",
        customResolution: foundAsset.customResolution || "",
        operatingSystem: foundAsset.operatingSystem || "Tizen",
        assetLocation: foundAsset.assetLocation || "Mumbai Corporate Office - Main Lobby",
        googleLocation: foundAsset.googleLocation || "Bandra Kurla Complex, Mumbai, Maharashtra, India",
        latitude: foundAsset.latitude || 19.0596,
        longitude: foundAsset.longitude || 72.8295,
        powerConsumption: foundAsset.powerConsumption || 150,
        macAddress: foundAsset.macAddress || "AA:BB:CC:DD:EE:01",
        contentManagementSystem: foundAsset.contentManagementSystem || "Samsung MagicInfo",
        displayOrientation: foundAsset.displayOrientation || "Landscape",
        operatingHours: foundAsset.operatingHours || "24/7 hours/day",
        purchaseDate: foundAsset.purchaseDate || "2023-01-15",
        installationDate: foundAsset.installationDate || "2023-01-20",
        warrantyStartDate: foundAsset.warrantyStartDate || "2023-01-15",
        warrantyPeriodMonths: foundAsset.warrantyPeriodMonths || 36,
        description: foundAsset.description || "Main lobby display screen",
        serialNumber: foundAsset.serialNumber || "SAM55-001",
      }
      setAsset(enhancedAsset)
    } else {
      router.push("/")
    }
  }, [params.id, assets, router])

  if (!asset) {
    return (
      <div className="flex items-center justify-center h-64 bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading asset details...</p>
        </div>
      </div>
    )
  }

  const category = categories.find((cat) => cat.id === asset.categoryId)

  const formatDate = (dateValue: string | undefined | null) => {
    if (!dateValue) return "Not specified"
    const date = new Date(dateValue)
    if (isNaN(date.getTime())) return "Invalid date"
    return format(date, "dd MMM yyyy")
  }

  const today = new Date()
  const warrantyStart = asset.warrantyStartDate ? new Date(asset.warrantyStartDate) : null
  const warrantyEnd = warrantyStart ? new Date(warrantyStart) : null

  if (warrantyEnd && warrantyStart && !isNaN(warrantyStart.getTime())) {
    warrantyEnd.setMonth(warrantyEnd.getMonth() + asset.warrantyPeriodMonths)
  }

  const isWarrantyActive = warrantyEnd ? today <= warrantyEnd : false
  const daysLeft = warrantyEnd ? Math.ceil((warrantyEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 0

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full h-11 w-11">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">{asset.name}</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Digital Signage Asset Details
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2 bg-transparent">
              <Printer className="h-4 w-4" />
              Print Details
            </Button>
            <Badge
              className={`px-4 py-2 rounded-full font-medium ${
                isWarrantyActive
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}
            >
              {isWarrantyActive ? `Warranty Active (${daysLeft} days left)` : "Warranty Expired"}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500 group">
            <CardHeader className="pb-6 bg-gradient-to-r from-blue-500/10 to-blue-600/5 border-b border-blue-500/20">
              <CardTitle className="text-xl flex items-center text-foreground font-semibold">
                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300">
                  <Info className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <span className="text-xl">Basic Information</span>
                  <p className="text-sm text-muted-foreground font-normal mt-1">Core asset specifications</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <div className="w-1 h-4 bg-blue-400 rounded-full"></div>
                    Asset Name
                  </p>
                  <p className="text-base font-semibold text-foreground leading-tight">{asset.name}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <div className="w-1 h-4 bg-blue-400 rounded-full"></div>
                    Category
                  </p>
                  <Badge
                    variant="secondary"
                    className="bg-blue-500/15 text-blue-300 border-blue-500/30 px-3 py-1 font-medium"
                  >
                    {category?.name || "Digital Display"}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <div className="w-1 h-4 bg-blue-400 rounded-full"></div>
                    Serial Number
                  </p>
                  <p className="text-sm font-mono bg-muted/70 px-4 py-3 rounded-xl text-muted-foreground border border-border/50">
                    {asset.serialNumber}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <div className="w-1 h-4 bg-blue-400 rounded-full"></div>
                    Manufacturer
                  </p>
                  <p className="text-sm text-muted-foreground font-semibold">{asset.manufacturer}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <div className="w-1 h-4 bg-blue-400 rounded-full"></div>
                    Model Number
                  </p>
                  <p className="text-sm text-muted-foreground font-semibold">{asset.modelNumber}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <div className="w-1 h-4 bg-blue-400 rounded-full"></div>
                    Screen Size
                  </p>
                  <p className="text-sm text-muted-foreground font-semibold">{asset.screenSize}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <div className="w-1 h-4 bg-blue-400 rounded-full"></div>
                    Resolution
                  </p>
                  <p className="text-sm text-muted-foreground font-semibold">{asset.resolution}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <div className="w-1 h-4 bg-blue-400 rounded-full"></div>
                    Operating System
                  </p>
                  <p className="text-sm text-muted-foreground font-semibold">{asset.operatingSystem}</p>
                </div>
              </div>
              {asset.description && (
                <div className="mt-8 pt-6 border-t border-border/50">
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <div className="w-1 h-4 bg-blue-400 rounded-full"></div>
                    Description
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 p-4 rounded-xl border border-border/50">
                    {asset.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl hover:shadow-green-500/5 transition-all duration-500 group">
            <CardHeader className="pb-6 bg-gradient-to-r from-green-500/10 to-green-600/5 border-b border-green-500/20">
              <CardTitle className="text-xl flex items-center text-foreground font-semibold">
                <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <span className="text-xl">Location Information</span>
                  <p className="text-sm text-muted-foreground font-normal mt-1">Geographic positioning data</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="space-y-2">
                <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <div className="w-1 h-4 bg-green-400 rounded-full"></div>
                  Asset Location
                </p>
                <p className="text-sm text-muted-foreground font-semibold leading-relaxed">{asset.assetLocation}</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <div className="w-1 h-4 bg-green-400 rounded-full"></div>
                  Google Location
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">{asset.googleLocation}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <div className="w-1 h-4 bg-green-400 rounded-full"></div>
                    Latitude
                  </p>
                  <p className="text-sm font-mono bg-muted/70 px-4 py-3 rounded-xl text-muted-foreground border border-border/50">
                    {asset.latitude}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <div className="w-1 h-4 bg-green-400 rounded-full"></div>
                    Longitude
                  </p>
                  <p className="text-sm font-mono bg-muted/70 px-4 py-3 rounded-xl text-muted-foreground border border-border/50">
                    {asset.longitude}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-500 group">
            <CardHeader className="pb-6 bg-gradient-to-r from-orange-500/10 to-orange-600/5 border-b border-orange-500/20">
              <CardTitle className="text-xl flex items-center text-foreground font-semibold">
                <div className="p-3 bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300">
                  <Monitor className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <span className="text-xl">Digital Signage Configuration</span>
                  <p className="text-sm text-muted-foreground font-normal mt-1">System configuration details</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="space-y-2">
                <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <div className="w-1 h-4 bg-orange-400 rounded-full"></div>
                  MAC Address
                </p>
                <p className="text-sm font-mono bg-muted/70 px-4 py-3 rounded-xl text-muted-foreground border border-border/50">
                  {asset.macAddress}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <div className="w-1 h-4 bg-orange-400 rounded-full"></div>
                  Content Management System
                </p>
                <p className="text-sm text-muted-foreground font-semibold">{asset.contentManagementSystem}</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <div className="w-1 h-4 bg-orange-400 rounded-full"></div>
                  Display Orientation
                </p>
                <p className="text-sm text-muted-foreground font-semibold">{asset.displayOrientation}</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <div className="w-1 h-4 bg-orange-400 rounded-full"></div>
                  Operating Hours
                </p>
                <p className="text-sm text-muted-foreground font-semibold">{asset.operatingHours}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-500 group">
            <CardHeader className="pb-6 bg-gradient-to-r from-purple-500/10 to-purple-600/5 border-b border-purple-500/20">
              <CardTitle className="text-xl flex items-center text-foreground font-semibold">
                <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <span className="text-xl">Warranty Information</span>
                  <p className="text-sm text-muted-foreground font-normal mt-1">Purchase and warranty details</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <div className="w-1 h-4 bg-purple-400 rounded-full"></div>
                    Purchase Date
                  </p>
                  <p className="text-sm text-muted-foreground font-semibold">{formatDate(asset.purchaseDate)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <div className="w-1 h-4 bg-purple-400 rounded-full"></div>
                    Installation Date
                  </p>
                  <p className="text-sm text-muted-foreground font-semibold">{formatDate(asset.installationDate)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <div className="w-1 h-4 bg-purple-400 rounded-full"></div>
                    Warranty Start
                  </p>
                  <p className="text-sm text-muted-foreground font-semibold">{formatDate(asset.warrantyStartDate)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <div className="w-1 h-4 bg-purple-400 rounded-full"></div>
                    Warranty Period
                  </p>
                  <p className="text-sm text-muted-foreground font-semibold">{asset.warrantyPeriodMonths} months</p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-border/50">
                <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-purple-400 rounded-full"></div>
                  Warranty Status
                </p>
                <Badge
                  className={`px-4 py-2 text-sm font-semibold ${
                    isWarrantyActive
                      ? "bg-green-500/15 text-green-300 border border-green-500/30"
                      : "bg-red-500/15 text-red-300 border border-red-500/30"
                  }`}
                >
                  {isWarrantyActive ? `Active (${daysLeft} days left)` : "Expired"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
