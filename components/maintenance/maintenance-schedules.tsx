"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Filter, Calendar, X, ChevronDown, ChevronUp } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, isToday, isThisWeek, isThisMonth, addDays, isBefore, parseISO } from "date-fns"
import { useAssetContext } from "@/lib/asset-context"
import type { Asset, MaintenanceStatus } from "@/lib/types"
import MaintenanceScheduleModal from "./maintenance-schedule-modal"

interface MaintenanceSchedulesProps {
  onViewAsset: (assetId: string) => void
}

export default function MaintenanceSchedules({ onViewAsset }: MaintenanceSchedulesProps) {
  const { assets, masterAssets, locations, maintenanceSchedules, updateAsset } = useAssetContext()
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentAsset, setCurrentAsset] = useState<Asset | null>(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | "all">("all")
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>("all")
  const [locationFilter, setLocationFilter] = useState<string>("all")
  const [timeRangeFilter, setTimeRangeFilter] = useState<string>("all")

  // Get unique service types from maintenance schedules
  const serviceTypes = Array.from(new Set(maintenanceSchedules.map((schedule) => schedule.serviceType)))

  // Calculate maintenance status for an asset
  const getMaintenanceStatus = (asset: Asset): MaintenanceStatus => {
    if (!asset.lastMaintenanceDate || !asset.maintenanceScheduleId) {
      return "no_maintenance"
    }

    const nextDate = asset.nextMaintenanceDate
      ? parseISO(asset.nextMaintenanceDate)
      : calculateNextMaintenanceDate(asset)

    if (isBefore(nextDate, new Date()) && !isToday(nextDate)) {
      return "overdue"
    } else if (isToday(nextDate)) {
      return "due_today"
    } else if (isThisWeek(nextDate)) {
      return "due_this_week"
    } else if (isThisMonth(nextDate)) {
      return "due_this_month"
    } else if (isBefore(nextDate, addDays(new Date(), 30))) {
      return "due_next_30_days"
    } else {
      return "upcoming"
    }
  }

  // Calculate next maintenance date based on last maintenance and schedule
  const calculateNextMaintenanceDate = (asset: Asset): Date => {
    if (!asset.lastMaintenanceDate || !asset.maintenanceScheduleId) {
      return new Date()
    }

    const lastDate = parseISO(asset.lastMaintenanceDate)
    const schedule = maintenanceSchedules.find((s) => s.id === asset.maintenanceScheduleId)

    if (!schedule) return new Date()

    const { intervalValue, intervalUnit } = schedule

    switch (intervalUnit) {
      case "hour":
        return new Date(lastDate.getTime() + intervalValue * 60 * 60 * 1000)
      case "day":
        return addDays(lastDate, intervalValue)
      case "week":
        return addDays(lastDate, intervalValue * 7)
      case "month":
        const newMonth = lastDate.getMonth() + intervalValue
        const newYear = lastDate.getFullYear() + Math.floor(newMonth / 12)
        return new Date(newYear, newMonth % 12, lastDate.getDate())
      case "year":
        return new Date(lastDate.getFullYear() + intervalValue, lastDate.getMonth(), lastDate.getDate())
      default:
        return new Date()
    }
  }

  // Get status badge for an asset
  const getStatusBadge = (status: MaintenanceStatus) => {
    switch (status) {
      case "overdue":
        return <Badge className="bg-red-500 text-white">Overdue</Badge>
      case "due_today":
        return <Badge className="bg-amber-500 text-white">Due Today</Badge>
      case "due_this_week":
        return <Badge className="bg-blue-500 text-white">Due This Week</Badge>
      case "due_this_month":
        return <Badge className="bg-green-500 text-white">Due This Month</Badge>
      case "due_next_30_days":
        return <Badge className="bg-purple-500 text-white">Due in 30 Days</Badge>
      case "upcoming":
        return <Badge className="bg-gray-500 text-white">Upcoming</Badge>
      case "no_maintenance":
        return <Badge className="bg-gray-300 text-gray-700">No Schedule</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  // Get maintenance schedule name
  const getScheduleName = (scheduleId: string | null) => {
    if (!scheduleId) return "None"
    const schedule = maintenanceSchedules.find((s) => s.id === scheduleId)
    return schedule ? schedule.name : "Unknown"
  }

  // Get service type
  const getServiceType = (scheduleId: string | null) => {
    if (!scheduleId) return "None"
    const schedule = maintenanceSchedules.find((s) => s.id === scheduleId)
    return schedule ? schedule.serviceType : "Unknown"
  }

  // Get interval display
  const getIntervalDisplay = (scheduleId: string | null) => {
    if (!scheduleId) return "None"
    const schedule = maintenanceSchedules.find((s) => s.id === scheduleId)
    if (!schedule) return "Unknown"
    return `${schedule.intervalValue} ${schedule.intervalUnit}${schedule.intervalValue > 1 ? "s" : ""}`
  }

  // Get asset name
  const getAssetName = (assetId: string) => {
    const asset = assets.find((a) => a.id === assetId)
    if (!asset) return "Unknown"

    const masterAsset = masterAssets.find((ma) => ma.id === asset.masterAssetId)
    return masterAsset ? masterAsset.name : "Unknown"
  }

  // Get location name
  const getLocationName = (locationId: string) => {
    const location = locations.find((l) => l.id === locationId)
    return location ? location.name : "Unknown"
  }

  // Apply filters
  useEffect(() => {
    let filtered = [...assets]

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((asset) => {
        const assetName = getAssetName(asset.id).toLowerCase()
        const serialNumber = asset.serialNumber.toLowerCase()
        return assetName.includes(query) || serialNumber.includes(query)
      })
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((asset) => getMaintenanceStatus(asset) === statusFilter)
    }

    // Apply service type filter
    if (serviceTypeFilter !== "all") {
      filtered = filtered.filter((asset) => {
        if (!asset.maintenanceScheduleId) return false
        const schedule = maintenanceSchedules.find((s) => s.id === asset.maintenanceScheduleId)
        return schedule?.serviceType === serviceTypeFilter
      })
    }

    // Apply location filter
    if (locationFilter !== "all") {
      filtered = filtered.filter((asset) => asset.locationId === locationFilter)
    }

    // Apply time range filter
    if (timeRangeFilter !== "all") {
      filtered = filtered.filter((asset) => {
        if (!asset.nextMaintenanceDate) return false
        const nextDate = parseISO(asset.nextMaintenanceDate)

        switch (timeRangeFilter) {
          case "today":
            return isToday(nextDate)
          case "this_week":
            return isThisWeek(nextDate)
          case "this_month":
            return isThisMonth(nextDate)
          case "next_30_days":
            return isBefore(nextDate, addDays(new Date(), 30))
          case "overdue":
            return isBefore(nextDate, new Date()) && !isToday(nextDate)
          default:
            return true
        }
      })
    }

    setFilteredAssets(filtered)
  }, [
    assets,
    searchQuery,
    statusFilter,
    serviceTypeFilter,
    locationFilter,
    timeRangeFilter,
    maintenanceSchedules,
    masterAssets,
    locations,
  ])

  const handleScheduleMaintenance = (asset: Asset) => {
    setCurrentAsset(asset)
    setIsModalOpen(true)
  }

  const handleSaveMaintenanceSchedule = (asset: Asset, scheduleId: string, lastMaintenanceDate: string) => {
    // Calculate next maintenance date
    const schedule = maintenanceSchedules.find((s) => s.id === scheduleId)
    let nextDate = new Date()

    if (schedule && lastMaintenanceDate) {
      const lastDate = parseISO(lastMaintenanceDate)
      const { intervalValue, intervalUnit } = schedule

      switch (intervalUnit) {
        case "hour":
          nextDate = new Date(lastDate.getTime() + intervalValue * 60 * 60 * 1000)
          break
        case "day":
          nextDate = addDays(lastDate, intervalValue)
          break
        case "week":
          nextDate = addDays(lastDate, intervalValue * 7)
          break
        case "month":
          const newMonth = lastDate.getMonth() + intervalValue
          const newYear = lastDate.getFullYear() + Math.floor(newMonth / 12)
          nextDate = new Date(newYear, newMonth % 12, lastDate.getDate())
          break
        case "year":
          nextDate = new Date(lastDate.getFullYear() + intervalValue, lastDate.getMonth(), lastDate.getDate())
          break
      }
    }

    // Update asset with new maintenance schedule
    const updatedAsset = {
      ...asset,
      maintenanceScheduleId: scheduleId,
      lastMaintenanceDate: lastMaintenanceDate,
      nextMaintenanceDate: format(nextDate, "yyyy-MM-dd"),
    }

    updateAsset(updatedAsset)
    setIsModalOpen(false)
  }

  const clearFilters = () => {
    setStatusFilter("all")
    setServiceTypeFilter("all")
    setLocationFilter("all")
    setTimeRangeFilter("all")
    setSearchQuery("")
  }

  // Count active filters
  const activeFilterCount = [
    statusFilter !== "all",
    serviceTypeFilter !== "all",
    locationFilter !== "all",
    timeRangeFilter !== "all",
    searchQuery !== "",
  ].filter(Boolean).length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Maintenance Schedules</h2>
        <div className="flex items-center space-x-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1"
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge className="ml-1 bg-primary text-primary-foreground">{activeFilterCount}</Badge>
            )}
            {showFilters ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Maintenance Status</label>
                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="due_today">Due Today</SelectItem>
                    <SelectItem value="due_this_week">Due This Week</SelectItem>
                    <SelectItem value="due_this_month">Due This Month</SelectItem>
                    <SelectItem value="due_next_30_days">Due in 30 Days</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="no_maintenance">No Schedule</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Service Type</label>
                <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Service Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Service Types</SelectItem>
                    {serviceTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Location</label>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Time Range</label>
                <Select value={timeRangeFilter} onValueChange={setTimeRangeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Time Ranges" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time Ranges</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="this_week">This Week</SelectItem>
                    <SelectItem value="this_month">This Month</SelectItem>
                    <SelectItem value="next_30_days">Next 30 Days</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Last Maintenance</TableHead>
              <TableHead>Next Due</TableHead>
              <TableHead>Service Type</TableHead>
              <TableHead>Interval</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssets.map((asset) => {
              const status = getMaintenanceStatus(asset)
              return (
                <TableRow key={asset.id}>
                  <TableCell className="font-medium">{getAssetName(asset.id)}</TableCell>
                  <TableCell>{getLocationName(asset.locationId)}</TableCell>
                  <TableCell>
                    {asset.lastMaintenanceDate ? format(parseISO(asset.lastMaintenanceDate), "dd MMM yyyy") : "Never"}
                  </TableCell>
                  <TableCell>
                    {asset.nextMaintenanceDate
                      ? format(parseISO(asset.nextMaintenanceDate), "dd MMM yyyy")
                      : "Not scheduled"}
                  </TableCell>
                  <TableCell>{getServiceType(asset.maintenanceScheduleId)}</TableCell>
                  <TableCell>{getIntervalDisplay(asset.maintenanceScheduleId)}</TableCell>
                  <TableCell>{getStatusBadge(status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleScheduleMaintenance(asset)}>
                        <Calendar className="h-4 w-4 mr-1" />
                        Schedule
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => onViewAsset(asset.id)}>
                        View
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
            {filteredAssets.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  No assets match the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {isModalOpen && currentAsset && (
        <MaintenanceScheduleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          asset={currentAsset}
          maintenanceSchedules={maintenanceSchedules}
          onSave={handleSaveMaintenanceSchedule}
        />
      )}
    </div>
  )
}
