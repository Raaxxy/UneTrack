"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, MapPin, Info, PenTool as Tool, Monitor, Wifi, Zap, Shield, X } from "lucide-react"
import type { Asset } from "@/lib/types"

interface AssetDetailModalProps {
  isOpen: boolean
  onClose: () => void
  asset: Asset
}

export default function AssetDetailModal({ isOpen, onClose, asset }: AssetDetailModalProps) {
  const today = new Date()
  const warrantyEnd = new Date(asset.warrantyEndDate || "")
  const isWarrantyActive = today <= warrantyEnd
  const daysLeft = Math.ceil((warrantyEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  const getWarrantyStatus = () => {
    if (!asset.warrantyEndDate) return { status: "Unknown", color: "bg-gray-500", textColor: "text-white" }
    if (isWarrantyActive) {
      if (daysLeft <= 30) return { status: `${daysLeft} days left`, color: "bg-orange-500", textColor: "text-white" }
      return { status: `${daysLeft} days left`, color: "bg-green-500", textColor: "text-white" }
    }
    return { status: "Expired", color: "bg-red-500", textColor: "text-white" }
  }

  const warrantyStatus = getWarrantyStatus()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1200px] max-h-[95vh] overflow-y-auto p-0 bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
          <div>
            <DialogTitle className="text-2xl font-bold text-gray-900">{asset.name}</DialogTitle>
            <p className="text-gray-600 mt-1">
              {asset.category} • Serial: {asset.serialNumber}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-8 space-y-6">
          {/* Basic Information Card */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
            <CardHeader className="bg-blue-50 border-b border-blue-100 pb-4">
              <CardTitle className="text-lg flex items-center text-blue-700">
                <div className="p-2 bg-blue-100 rounded-full mr-3">
                  <Info className="h-5 w-5 text-blue-600" />
                </div>
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Asset Name</p>
                  <p className="text-lg font-semibold text-gray-900">{asset.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Category</p>
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1">{asset.category}</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Manufacturer</p>
                  <p className="text-base text-gray-700">{asset.manufacturer || "Not specified"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Model</p>
                  <p className="text-base text-gray-700">{asset.model || "Not specified"}</p>
                </div>
              </div>
              {asset.description && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-500 mb-2">Description</p>
                  <p className="text-base text-gray-700 leading-relaxed">{asset.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location Information Card */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
            <CardHeader className="bg-green-50 border-b border-green-100 pb-4">
              <CardTitle className="text-lg flex items-center text-green-700">
                <div className="p-2 bg-green-100 rounded-full mr-3">
                  <MapPin className="h-5 w-5 text-green-600" />
                </div>
                Location Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Address</p>
                <p className="text-base text-gray-700">{asset.location || "Not specified"}</p>
              </div>
              {asset.coordinates && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Coordinates</p>
                  <p className="text-base font-mono bg-gray-100 px-3 py-2 rounded-lg text-gray-800">
                    {asset.coordinates}
                  </p>
                </div>
              )}
              {asset.googleLocation && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Google Location</p>
                  <p className="text-base text-gray-700">{asset.googleLocation}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Installation & Warranty Card */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
            <CardHeader className="bg-orange-50 border-b border-orange-100 pb-4">
              <CardTitle className="text-lg flex items-center text-orange-700">
                <div className="p-2 bg-orange-100 rounded-full mr-3">
                  <Shield className="h-5 w-5 text-orange-600" />
                </div>
                Installation & Warranty
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500 mb-1">Purchase Date</p>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <p className="text-base text-gray-700">{asset.purchaseDate || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500 mb-1">Installation Date</p>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <p className="text-base text-gray-700">{asset.installationDate || "Not specified"}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500 mb-1">Warranty Start</p>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <p className="text-base text-gray-700">{asset.warrantyStartDate || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500 mb-1">Warranty End</p>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <p className="text-base text-gray-700">{asset.warrantyEndDate || "Not specified"}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-center bg-gray-50 p-6 rounded-lg w-full">
                    <p className="text-sm font-medium text-gray-500 mb-3">Warranty Status</p>
                    <Badge
                      className={`${warrantyStatus.color} ${warrantyStatus.textColor} px-4 py-2 text-sm font-medium`}
                    >
                      {warrantyStatus.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Information Card */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
            <CardHeader className="bg-purple-50 border-b border-purple-100 pb-4">
              <CardTitle className="text-lg flex items-center text-purple-700">
                <div className="p-2 bg-purple-100 rounded-full mr-3">
                  <Monitor className="h-5 w-5 text-purple-600" />
                </div>
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {asset.screenSize && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500 mb-1">Screen Size</p>
                    <p className="text-lg font-semibold text-gray-900">{asset.screenSize}</p>
                  </div>
                )}
                {asset.resolution && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500 mb-1">Resolution</p>
                    <p className="text-lg font-semibold text-gray-900">{asset.resolution}</p>
                  </div>
                )}
                {asset.ipAddress && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500 mb-1">IP Address</p>
                    <div className="flex items-center">
                      <Wifi className="h-4 w-4 mr-2 text-purple-600" />
                      <p className="text-base font-mono text-gray-900">{asset.ipAddress}</p>
                    </div>
                  </div>
                )}
                {asset.macAddress && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500 mb-1">MAC Address</p>
                    <p className="text-base font-mono text-gray-900">{asset.macAddress}</p>
                  </div>
                )}
                {asset.powerConsumption && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500 mb-1">Power Consumption</p>
                    <div className="flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-purple-600" />
                      <p className="text-base text-gray-900">{asset.powerConsumption}</p>
                    </div>
                  </div>
                )}
                {asset.connectivity && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500 mb-1">Connectivity</p>
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 px-3 py-1">
                      {asset.connectivity}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Information Card */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
            <CardHeader className="bg-red-50 border-b border-red-100 pb-4">
              <CardTitle className="text-lg flex items-center text-red-700">
                <div className="p-2 bg-red-100 rounded-full mr-3">
                  <Tool className="h-5 w-5 text-red-600" />
                </div>
                Maintenance Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {asset.operatingHours && (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-500 mb-1">Operating Hours</p>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-red-600" />
                        <p className="text-lg font-semibold text-gray-900">{asset.operatingHours}</p>
                      </div>
                    </div>
                  )}
                  {asset.brightness && (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-500 mb-1">Brightness Level</p>
                      <p className="text-lg font-semibold text-gray-900">{asset.brightness}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {asset.lastMaintenanceDate && (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-500 mb-1">Last Maintenance</p>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-red-600" />
                        <p className="text-base text-gray-900">{asset.lastMaintenanceDate}</p>
                      </div>
                    </div>
                  )}
                  {asset.nextMaintenanceDate && (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-500 mb-1">Next Maintenance</p>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-red-600" />
                        <p className="text-base text-gray-900">{asset.nextMaintenanceDate}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
