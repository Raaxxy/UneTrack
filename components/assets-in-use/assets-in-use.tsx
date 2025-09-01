"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  PlusCircle,
  Pencil,
  Trash2,
  Search,
  Filter,
  X,
  Download,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Copy,
  MapPin,
  AlertTriangle,
} from "lucide-react"
import type { Asset, Location, Section, SubSection, Zone, AssetCategory } from "@/lib/types"
import { UnifiedAssetModal } from "./unified-asset-modal"
import DeleteConfirmationModal from "../shared/delete-confirmation-modal"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { isAfter, isBefore } from "date-fns"

interface AssetsInUseProps {
  assets: Asset[]
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>
  locations: Location[]
  sections: Section[]
  subSections: SubSection[]
  zones: Zone[]
  categories?: AssetCategory[]
}

interface FilterState {
  locationId: string
  sectionId: string
  subSectionId: string
  zoneId: string
  categoryId: string
  warrantyStatus: "all" | "active" | "expiring" | "expired"
  maintenanceStatus: "all" | "overdue" | "due_soon" | "up_to_date"
  dateRange: {
    start: string
    end: string
  }
}

export default function AssetsInUse({
  assets,
  setAssets,
  locations,
  sections,
  subSections,
  zones,
  categories = [],
}: AssetsInUseProps) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentAsset, setCurrentAsset] = useState<Asset | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<keyof Asset>("id")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [filters, setFilters] = useState<FilterState>({
    locationId: "",
    sectionId: "",
    subSectionId: "",
    zoneId: "",
    categoryId: "",
    warrantyStatus: "all",
    maintenanceStatus: "all",
    dateRange: { start: "", end: "" },
  })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const handleAddAsset = () => {
    setCurrentAsset(null)
    setIsModalOpen(true)
  }

  const handleEditAsset = (asset: Asset) => {
    setCurrentAsset(asset)
    setIsModalOpen(true)
  }

  const handleDeleteAsset = (asset: Asset) => {
    setCurrentAsset(asset)
    setIsDeleteModalOpen(true)
  }

  const handleBulkDelete = () => {
    if (selectedAssets.length === 0) return

    setAssets(assets.filter((asset) => !selectedAssets.includes(asset.id)))
    setSelectedAssets([])
    toast({
      title: "Assets Deleted",
      description: `${selectedAssets.length} assets have been successfully deleted.`,
    })
  }

  const handleBulkStatusUpdate = (status: string) => {
    if (selectedAssets.length === 0) return

    setAssets(assets.map((asset) => (selectedAssets.includes(asset.id) ? { ...asset, status: status as any } : asset)))
    setSelectedAssets([])
    toast({
      title: "Status Updated",
      description: `${selectedAssets.length} assets status updated to ${status}.`,
    })
  }

  const handleDuplicateAsset = (asset: Asset) => {
    const newId = (Math.max(...assets.map((a) => Number.parseInt(a.id)), 0) + 1).toString()
    const duplicatedAsset = {
      ...asset,
      id: newId,
      serialNumber: `${asset.serialNumber}-COPY`,
      barcode: `${asset.barcode}-COPY`,
      description: `${asset.description} (Copy)`,
    }
    setAssets([...assets, duplicatedAsset])
    toast({
      title: "Asset Duplicated",
      description: "Asset has been successfully duplicated.",
    })
  }

  const confirmDelete = () => {
    if (!currentAsset) return

    setAssets(assets.filter((asset) => asset.id !== currentAsset.id))
    toast({
      title: "Asset Deleted",
      description: "The asset has been successfully deleted.",
    })

    setIsDeleteModalOpen(false)
  }

  const saveAsset = (asset: Asset) => {
    if (currentAsset) {
      setAssets(assets.map((a) => (a.id === asset.id ? asset : a)))
      toast({
        title: "Asset Updated",
        description: "The asset has been successfully updated.",
      })
    } else {
      const newId = (Math.max(...assets.map((a) => Number.parseInt(a.id)), 0) + 1).toString()
      setAssets([...assets, { ...asset, id: newId }])
      toast({
        title: "Asset Created",
        description: "The new asset has been successfully created.",
      })
    }
    setIsModalOpen(false)
  }

  const handleExportData = (format: "csv" | "excel" = "csv") => {
    const dataToExport = filteredAssets

    if (format === "csv") {
      const headers = [
        "Asset Name",
        "Category",
        "Asset Location",
        "Google Location",
        "Latitude",
        "Longitude",
        "Manufacturer",
        "Model Number",
        "Screen Size",
        "Custom Screen Size",
        "Resolution",
        "Custom Resolution",
        "Power Consumption",
        "Operating System",
        "Description",
        "Purchase Date",
        "Installation Date",
        "Warranty Start Date",
        "Warranty Period (Months)",
        "MAC Address",
        "Content Management System",
        "Display Orientation",
        "Operating Hours",
      ]
      const csvRows = [headers.join(",")]

      dataToExport.forEach((asset) => {
        const row = [
          `"${asset.name || ""}"`,
          `"${getCategoryName(asset.categoryId || "")}"`,
          `"${asset.assetLocation || ""}"`,
          `"${asset.googleLocation || ""}"`,
          asset.latitude || "",
          asset.longitude || "",
          `"${asset.manufacturer || ""}"`,
          `"${asset.modelNumber || ""}"`,
          `"${asset.screenSize || ""}"`,
          asset.customScreenSize || "",
          `"${asset.resolution || ""}"`,
          `"${asset.customResolution || ""}"`,
          asset.powerConsumption || "",
          `"${asset.operatingSystem || ""}"`,
          `"${asset.description || ""}"`,
          `"${asset.purchaseDate || ""}"`,
          `"${asset.installationDate || ""}"`,
          `"${asset.warrantyStartDate || ""}"`,
          asset.warrantyPeriodMonths || "",
          `"${asset.macAddress || ""}"`,
          `"${asset.contentManagementSystem || ""}"`,
          `"${asset.displayOrientation || ""}"`,
          asset.operatingHours || "",
        ]
        csvRows.push(row.join(","))
      })

      const csvString = csvRows.join("\n")
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" })
      downloadFile(blob, `assets_export_${new Date().toISOString().split("T")[0]}.csv`)
    } else if (format === "excel") {
      const headers = [
        "Asset Name",
        "Category",
        "Asset Location",
        "Google Location",
        "Latitude",
        "Longitude",
        "Manufacturer",
        "Model Number",
        "Screen Size",
        "Custom Screen Size",
        "Resolution",
        "Custom Resolution",
        "Power Consumption",
        "Operating System",
        "Description",
        "Purchase Date",
        "Installation Date",
        "Warranty Start Date",
        "Warranty Period (Months)",
        "MAC Address",
        "Content Management System",
        "Display Orientation",
        "Operating Hours",
      ]

      const csvRows = [headers.join(",")]

      dataToExport.forEach((asset) => {
        const row = [
          `"${asset.name || ""}"`,
          `"${getCategoryName(asset.categoryId || "")}"`,
          `"${asset.assetLocation || ""}"`,
          `"${asset.googleLocation || ""}"`,
          asset.latitude || "",
          asset.longitude || "",
          `"${asset.manufacturer || ""}"`,
          `"${asset.modelNumber || ""}"`,
          `"${asset.screenSize || ""}"`,
          asset.customScreenSize || "",
          `"${asset.resolution || ""}"`,
          `"${asset.customResolution || ""}"`,
          asset.powerConsumption || "",
          `"${asset.operatingSystem || ""}"`,
          `"${asset.description || ""}"`,
          `"${asset.purchaseDate || ""}"`,
          `"${asset.installationDate || ""}"`,
          `"${asset.warrantyStartDate || ""}"`,
          asset.warrantyPeriodMonths || "",
          `"${asset.macAddress || ""}"`,
          `"${asset.contentManagementSystem || ""}"`,
          `"${asset.displayOrientation || ""}"`,
          asset.operatingHours || "",
        ]
        csvRows.push(row.join(","))
      })

      const csvString = "\uFEFF" + csvRows.join("\n") // Add BOM for Excel
      const blob = new Blob([csvString], { type: "application/vnd.ms-excel;charset=utf-8;" })
      downloadFile(blob, `assets_export_${new Date().toISOString().split("T")[0]}.xlsx`)
    }

    toast({
      title: "Export Complete",
      description: `${dataToExport.length} assets exported as ${format.toUpperCase()}.`,
    })
  }

  const handleDownloadTemplate = (format: "csv" | "excel" = "csv") => {
    const headers = [
      "Asset Name",
      "Category",
      "Asset Location",
      "Google Location",
      "Latitude",
      "Longitude",
      "Manufacturer",
      "Model Number",
      "Screen Size",
      "Custom Screen Size",
      "Resolution",
      "Custom Resolution",
      "Power Consumption",
      "Operating System",
      "Description",
      "Purchase Date",
      "Installation Date",
      "Warranty Start Date",
      "Warranty Period (Months)",
      "MAC Address",
      "Content Management System",
      "Display Orientation",
      "Operating Hours",
    ]

    const sampleRow = [
      "Asset Name",
      "Category",
      "Location",
      "Google Location",
      "Latitude",
      "Longitude",
      "Manufacturer",
      "Model Number",
      "Screen Size",
      "Custom Screen Size",
      "Resolution",
      "Custom Resolution",
      "Power Consumption",
      "Operating System",
      "Description",
      "Purchase Date",
      "Installation Date",
      "Warranty Start Date",
      "Warranty Period (Months)",
      "MAC Address",
      "Content Management System",
      "Display Orientation",
      "Operating Hours",
    ]

    const csvRows = [headers.join(","), sampleRow.join(",")]

    if (format === "excel") {
      const csvString = "\uFEFF" + csvRows.join("\n") // Add BOM for Excel
      const blob = new Blob([csvString], { type: "application/vnd.ms-excel;charset=utf-8;" })
      downloadFile(blob, `asset_import_template.xlsx`)
    } else {
      const csvString = csvRows.join("\n")
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" })
      downloadFile(blob, `asset_import_template.csv`)
    }

    toast({
      title: "Template Downloaded",
      description: `Import template downloaded as ${format.toUpperCase()}.`,
    })
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split("\n")
      const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim())

      const importedAssets: Asset[] = []

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.replace(/"/g, "").trim())
        if (values.length >= 23 && values[0]) {
          const newId = (
            Math.max(...assets.map((a) => Number.parseInt(a.id)), 0) +
            importedAssets.length +
            1
          ).toString()

          const newAsset: Asset = {
            id: newId,
            name: values[0],
            categoryId: categories.find((c) => c.name === values[1])?.id || "",
            assetLocation: values[2],
            googleLocation: values[3],
            latitude: values[4] ? Number.parseFloat(values[4]) : undefined,
            longitude: values[5] ? Number.parseFloat(values[5]) : undefined,
            manufacturer: values[6],
            modelNumber: values[7],
            screenSize: values[8],
            customScreenSize: values[9] ? Number.parseFloat(values[9]) : undefined,
            resolution: values[10],
            customResolution: values[11],
            powerConsumption: values[12] ? Number.parseFloat(values[12]) : 0,
            operatingSystem: values[13],
            description: values[14],
            purchaseDate: values[15],
            installationDate: values[16],
            warrantyStartDate: values[17],
            warrantyPeriodMonths: values[18] ? Number.parseInt(values[18]) : 12,
            macAddress: values[19],
            contentManagementSystem: values[20],
            displayOrientation: (values[21] as "Landscape" | "Portrait") || "Landscape",
            operatingHours: values[22] ? Number.parseInt(values[22]) : 8,
            locationId: locations.find((l) => l.name.includes(values[2]))?.id || "",
            serialNumber: `SN-${newId}`,
            barcode: `BC-${newId}`,
            sectionId: "",
            subSectionId: "",
            zoneId: "",
          }

          importedAssets.push(newAsset)
        }
      }

      if (importedAssets.length > 0) {
        setAssets([...assets, ...importedAssets])
        toast({
          title: "Import Successful",
          description: `${importedAssets.length} assets imported successfully.`,
        })
      }
    }

    reader.readAsText(file)
    event.target.value = "" // Reset file input
  }

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getAssetName = (asset: Asset) => {
    return asset.name || "Unknown"
  }

  const getCategoryName = (id: string) => {
    const category = categories.find((cat) => cat.id === id)
    return category ? category.name : "Unknown"
  }

  const getLocationName = (id: string) => {
    const location = locations.find((loc) => loc.id === id)
    return location ? location.name : "Unknown"
  }

  const getZoneName = (id: string) => {
    const zone = zones.find((z) => z.id === id)
    return zone ? zone.name : "Unknown"
  }

  const getCategoryIdForAsset = (asset: Asset) => {
    return asset.categoryId || ""
  }

  const getAssetStatus = (asset: Asset) => {
    const currentDate = new Date()
    const warrantyEnd = new Date(asset.warrantyEndDate)
    const nextMaintenance = asset.nextMaintenanceDate ? new Date(asset.nextMaintenanceDate) : null

    if (nextMaintenance && isBefore(nextMaintenance, currentDate)) {
      return "Maintenance Overdue"
    }
    if (isBefore(warrantyEnd, currentDate)) {
      return "Warranty Expired"
    }
    return "Active"
  }

  const getStatusBadge = (asset: Asset) => {
    const status = getAssetStatus(asset)
    const variant = status === "Active" ? "default" : status === "Warranty Expired" ? "secondary" : "destructive"

    return <Badge variant={variant}>{status}</Badge>
  }

  const filteredAndSortedAssets = useMemo(() => {
    let filtered = assets

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter((asset) => {
        const assetName = getAssetName(asset).toLowerCase()
        const serialNumber = asset.serialNumber.toLowerCase()
        const ipAddress = asset.ipAddress ? asset.ipAddress.toLowerCase() : ""
        const query = searchQuery.toLowerCase()
        return (
          assetName.includes(query) ||
          serialNumber.includes(query) ||
          asset.id.toLowerCase().includes(query) ||
          ipAddress.includes(query)
        )
      })
    }

    // Apply filters
    if (filters.locationId) {
      filtered = filtered.filter((asset) => asset.locationId === filters.locationId)
    }
    if (filters.categoryId) {
      filtered = filtered.filter((asset) => {
        return asset.categoryId === filters.categoryId
      })
    }
    if (filters.warrantyStatus !== "all") {
      filtered = filtered.filter((asset) => {
        const currentDate = new Date()
        const warrantyEnd = new Date(asset.warrantyEndDate)
        const threeMonthsFromNow = new Date()
        threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3)

        switch (filters.warrantyStatus) {
          case "active":
            return isAfter(warrantyEnd, currentDate)
          case "expiring":
            return isAfter(warrantyEnd, currentDate) && isBefore(warrantyEnd, threeMonthsFromNow)
          case "expired":
            return isBefore(warrantyEnd, currentDate)
          default:
            return true
        }
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === "masterAssetId" || sortField === "name") {
        aValue = getAssetName(a)
        bValue = getAssetName(b)
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }, [assets, searchQuery, filters, sortField, sortDirection, categories])

  const filteredAssets = filteredAndSortedAssets

  // Pagination logic
  const paginatedAssets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAssets.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAssets, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSort = (field: keyof Asset) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAssets(paginatedAssets.map((asset) => asset.id))
    } else {
      setSelectedAssets([])
    }
  }

  const handleSelectAsset = (assetId: string, checked: boolean) => {
    if (checked) {
      setSelectedAssets([...selectedAssets, assetId])
    } else {
      setSelectedAssets(selectedAssets.filter((id) => id !== assetId))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-muted-foreground">
            {assets.length} total assets
            {selectedAssets.length > 0 && ` • ${selectedAssets.length} selected`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search assets, serial numbers..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {showFilters ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Export
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Export Format</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExportData("csv")}>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportData("excel")}>Export as Excel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <PlusCircle className="h-4 w-4" />
                Import
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Import Assets</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => document.getElementById("csv-import")?.click()}>
                Import CSV File
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => document.getElementById("excel-import")?.click()}>
                Import Excel File
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Download Templates</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleDownloadTemplate("csv")}>Download CSV Template</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownloadTemplate("excel")}>
                Download Excel Template
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <input id="csv-import" type="file" accept=".csv" style={{ display: "none" }} onChange={handleImportData} />
          <input
            id="excel-import"
            type="file"
            accept=".xlsx,.xls"
            style={{ display: "none" }}
            onChange={handleImportData}
          />

          <Button onClick={handleAddAsset} size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Asset
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Advanced Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Select
                  value={filters.locationId}
                  onValueChange={(value) => setFilters({ ...filters, locationId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={filters.categoryId}
                  onValueChange={(value) => setFilters({ ...filters, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Warranty Status</label>
                <Select
                  value={filters.warrantyStatus}
                  onValueChange={(value: any) => setFilters({ ...filters, warrantyStatus: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All warranties</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expiring">Expiring soon</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Items per page</label>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters({
                      locationId: "",
                      sectionId: "",
                      subSectionId: "",
                      zoneId: "",
                      categoryId: "",
                      warrantyStatus: "all",
                      maintenanceStatus: "all",
                      dateRange: { start: "", end: "" },
                    })
                  }
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedAssets.length === paginatedAssets.length && paginatedAssets.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="cursor-pointer select-none hover:bg-muted/50" onClick={() => handleSort("name")}>
                <div className="flex items-center gap-1">
                  Asset Name
                  {sortField === "name" && (sortDirection === "asc" ? "↑" : "↓")}
                </div>
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Warranty Status</TableHead>
              <TableHead>Operating Hours</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAssets.length > 0 ? (
              paginatedAssets.map((asset) => {
                const assetName = getAssetName(asset)
                const categoryName = getCategoryName(asset.categoryId || "")
                const locationName = getLocationName(asset.locationId)

                return (
                  <TableRow
                    key={asset.id}
                    className={`${selectedAssets.includes(asset.id) ? "bg-muted/50" : ""} cursor-pointer hover:bg-muted/30 transition-colors`}
                    onClick={() => router.push(`/assets/${asset.id}`)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedAssets.includes(asset.id)}
                        onCheckedChange={(checked) => handleSelectAsset(asset.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{assetName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{categoryName}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{locationName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(asset)}</TableCell>
                    <TableCell className="text-sm">
                      {asset.operatingHours || <span className="text-muted-foreground">Not set</span>}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditAsset(asset)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateAsset(asset)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteAsset(asset)} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No assets found matching your criteria.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchQuery("")
                        setFilters({
                          locationId: "",
                          sectionId: "",
                          subSectionId: "",
                          zoneId: "",
                          categoryId: "",
                          warrantyStatus: "all",
                          maintenanceStatus: "all",
                          dateRange: { start: "", end: "" },
                        })
                      }}
                    >
                      Clear all filters
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredAssets.length)} of {filteredAssets.length} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="h-8 w-8 p-0"
                  >
                    {page}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <UnifiedAssetModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={saveAsset}
          locations={locations}
          sections={sections}
          subSections={subSections}
          zones={zones}
          categories={categories}
          asset={currentAsset}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Asset"
          description="Are you sure you want to delete this asset? This action cannot be undone."
        />
      )}
    </div>
  )
}
