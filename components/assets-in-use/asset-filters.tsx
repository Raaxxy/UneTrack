"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Save, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { Location, Section, SubSection, Zone, AssetCategory } from "@/lib/types"

interface FilterState {
  locationId: string
  sectionId: string
  subSectionId: string
  zoneId: string
  categoryId: string
  assetNameSearch: string
  serialNumberSearch: string
  installationDateStart: Date | null
  installationDateEnd: Date | null
  warrantyStatus: "all" | "valid" | "expired"
  timeSpentMin: number | null
  timeSpentMax: number | null
  quickSearch: string
  maintenanceDueFilter: "all" | "due_today" | "due_this_week" | "due_this_month" | "overdue" | "custom"
  maintenanceDueDateStart: Date | null
  maintenanceDueDateEnd: Date | null
}

interface AssetFiltersProps {
  filters: FilterState
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>
  locations: Location[]
  sections: Section[]
  subSections: SubSection[]
  zones: Zone[]
  categories: AssetCategory[]
  onClearFilters: () => void
  onSaveFilter: () => void
}

export default function AssetFilters({
  filters,
  setFilters,
  locations,
  sections,
  subSections,
  zones,
  categories,
  onClearFilters,
  onSaveFilter,
}: AssetFiltersProps) {
  const [filteredSections, setFilteredSections] = useState<Section[]>([])
  const [filteredSubSections, setFilteredSubSections] = useState<SubSection[]>([])
  const [filteredZones, setFilteredZones] = useState<Zone[]>([])
  const [timeSpentRange, setTimeSpentRange] = useState<[number, number]>([
    filters.timeSpentMin || 0,
    filters.timeSpentMax || 1000,
  ])
  const [showCustomDateRange, setShowCustomDateRange] = useState(filters.maintenanceDueFilter === "custom")

  // Update filtered sections when location changes
  useEffect(() => {
    if (filters.locationId) {
      setFilteredSections(sections.filter((section) => section.locationId === filters.locationId))
    } else {
      setFilteredSections([])
    }
  }, [filters.locationId, sections])

  // Update filtered subsections when section changes
  useEffect(() => {
    if (filters.sectionId) {
      setFilteredSubSections(subSections.filter((subSection) => subSection.sectionId === filters.sectionId))
    } else {
      setFilteredSubSections([])
    }
  }, [filters.sectionId, subSections])

  // Update filtered zones when subsection changes
  useEffect(() => {
    if (filters.subSectionId) {
      setFilteredZones(zones.filter((zone) => zone.subSectionId === filters.subSectionId))
    } else {
      setFilteredZones([])
    }
  }, [filters.subSectionId, zones])

  // Update time spent filter when slider changes
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      timeSpentMin: timeSpentRange[0] > 0 ? timeSpentRange[0] : null,
      timeSpentMax: timeSpentRange[1] < 1000 ? timeSpentRange[1] : null,
    }))
  }, [timeSpentRange, setFilters])

  // Update custom date range visibility when maintenance due filter changes
  useEffect(() => {
    setShowCustomDateRange(filters.maintenanceDueFilter === "custom")
  }, [filters.maintenanceDueFilter])

  // Handle maintenance due filter change
  const handleMaintenanceDueFilterChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      maintenanceDueFilter: value as FilterState["maintenanceDueFilter"],
      // Reset custom date range if not selecting custom
      ...(value !== "custom" && {
        maintenanceDueDateStart: null,
        maintenanceDueDateEnd: null,
      }),
    }))
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Location Hierarchy Filters */}
        <div>
          <Label htmlFor="location-filter">Location</Label>
          <Select value={filters.locationId} onValueChange={(value) => setFilters({ ...filters, locationId: value })}>
            <SelectTrigger id="location-filter">
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
          <Label htmlFor="section-filter">Section</Label>
          <Select
            value={filters.sectionId}
            onValueChange={(value) => setFilters({ ...filters, sectionId: value })}
            disabled={!filters.locationId}
          >
            <SelectTrigger id="section-filter">
              <SelectValue placeholder="All Sections" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sections</SelectItem>
              {filteredSections.map((section) => (
                <SelectItem key={section.id} value={section.id}>
                  {section.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="subsection-filter">Sub-section</Label>
          <Select
            value={filters.subSectionId}
            onValueChange={(value) => setFilters({ ...filters, subSectionId: value })}
            disabled={!filters.sectionId}
          >
            <SelectTrigger id="subsection-filter">
              <SelectValue placeholder="All Sub-sections" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sub-sections</SelectItem>
              {filteredSubSections.map((subSection) => (
                <SelectItem key={subSection.id} value={subSection.id}>
                  {subSection.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="zone-filter">Zone</Label>
          <Select
            value={filters.zoneId}
            onValueChange={(value) => setFilters({ ...filters, zoneId: value })}
            disabled={!filters.subSectionId}
          >
            <SelectTrigger id="zone-filter">
              <SelectValue placeholder="All Zones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Zones</SelectItem>
              {filteredZones.map((zone) => (
                <SelectItem key={zone.id} value={zone.id}>
                  {zone.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Asset Category Filter */}
        <div>
          <Label htmlFor="category-filter">Asset Category</Label>
          <Select value={filters.categoryId} onValueChange={(value) => setFilters({ ...filters, categoryId: value })}>
            <SelectTrigger id="category-filter">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Asset Name Search */}
        <div>
          <Label htmlFor="asset-name-search">Asset Name</Label>
          <div className="relative">
            <Input
              id="asset-name-search"
              placeholder="Search asset name..."
              value={filters.assetNameSearch}
              onChange={(e) => setFilters({ ...filters, assetNameSearch: e.target.value })}
            />
            {filters.assetNameSearch && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setFilters({ ...filters, assetNameSearch: "" })}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Serial Number Search */}
        <div>
          <Label htmlFor="serial-number-search">Serial Number</Label>
          <div className="relative">
            <Input
              id="serial-number-search"
              placeholder="Search serial number..."
              value={filters.serialNumberSearch}
              onChange={(e) => setFilters({ ...filters, serialNumberSearch: e.target.value })}
            />
            {filters.serialNumberSearch && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setFilters({ ...filters, serialNumberSearch: "" })}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Warranty Status Filter */}
        <div>
          <Label htmlFor="warranty-status-filter">Warranty Status</Label>
          <Select
            value={filters.warrantyStatus}
            onValueChange={(value: "all" | "valid" | "expired") => setFilters({ ...filters, warrantyStatus: value })}
          >
            <SelectTrigger id="warranty-status-filter">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="valid">Valid</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Next Maintenance Due Date Filter */}
        <div>
          <Label htmlFor="maintenance-due-filter">Next Maintenance Due Date</Label>
          <Select value={filters.maintenanceDueFilter} onValueChange={handleMaintenanceDueFilterChange}>
            <SelectTrigger id="maintenance-due-filter">
              <SelectValue placeholder="All Due Dates" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Due Dates</SelectItem>
              <SelectItem value="due_today">Due Today</SelectItem>
              <SelectItem value="due_this_week">Due This Week</SelectItem>
              <SelectItem value="due_this_month">Due This Month</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="custom">Custom Date Range</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Custom Maintenance Due Date Range */}
      {showCustomDateRange && (
        <div className="space-y-2">
          <Label>Maintenance Due Date Range</Label>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="maintenance-date-from" className="text-xs text-muted-foreground">
                From
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="maintenance-date-from"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.maintenanceDueDateStart && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.maintenanceDueDateStart ? (
                      format(filters.maintenanceDueDateStart, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    {filters.maintenanceDueDateStart && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto h-4 w-4"
                        onClick={(e) => {
                          e.stopPropagation()
                          setFilters({ ...filters, maintenanceDueDateStart: null })
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.maintenanceDueDateStart || undefined}
                    onSelect={(date) => setFilters({ ...filters, maintenanceDueDateStart: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="maintenance-date-to" className="text-xs text-muted-foreground">
                To
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="maintenance-date-to"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.maintenanceDueDateEnd && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.maintenanceDueDateEnd ? (
                      format(filters.maintenanceDueDateEnd, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    {filters.maintenanceDueDateEnd && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto h-4 w-4"
                        onClick={(e) => {
                          e.stopPropagation()
                          setFilters({ ...filters, maintenanceDueDateEnd: null })
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.maintenanceDueDateEnd || undefined}
                    onSelect={(date) => setFilters({ ...filters, maintenanceDueDateEnd: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      )}

      {/* Installation Date Range */}
      <div className="space-y-2">
        <Label>Installation Date Range</Label>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="date-from" className="text-xs text-muted-foreground">
              From
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date-from"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.installationDateStart && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.installationDateStart ? (
                    format(filters.installationDateStart, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                  {filters.installationDateStart && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto h-4 w-4"
                      onClick={(e) => {
                        e.stopPropagation()
                        setFilters({ ...filters, installationDateStart: null })
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.installationDateStart || undefined}
                  onSelect={(date) => setFilters({ ...filters, installationDateStart: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="date-to" className="text-xs text-muted-foreground">
              To
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date-to"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.installationDateEnd && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.installationDateEnd ? format(filters.installationDateEnd, "PPP") : <span>Pick a date</span>}
                  {filters.installationDateEnd && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto h-4 w-4"
                      onClick={(e) => {
                        e.stopPropagation()
                        setFilters({ ...filters, installationDateEnd: null })
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.installationDateEnd || undefined}
                  onSelect={(date) => setFilters({ ...filters, installationDateEnd: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Time Spent Range */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Time Spent Range (minutes)</Label>
          <span className="text-sm text-muted-foreground">
            {timeSpentRange[0]} - {timeSpentRange[1] === 1000 ? "∞" : timeSpentRange[1]}
          </span>
        </div>
        <Slider
          defaultValue={[0, 1000]}
          min={0}
          max={1000}
          step={10}
          value={timeSpentRange}
          onValueChange={setTimeSpentRange}
          className="py-4"
        />
      </div>

      {/* Filter Actions */}
      <div className="flex justify-end space-x-2 pt-2">
        <Button variant="outline" onClick={onClearFilters}>
          <X className="mr-2 h-4 w-4" />
          Clear Filters
        </Button>
        <Button onClick={onSaveFilter}>
          <Save className="mr-2 h-4 w-4" />
          Save Filter
        </Button>
      </div>
    </div>
  )
}
