"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Line,
  ComposedChart,
  Legend,
  RadialBarChart,
  RadialBar,
} from "recharts"
import {
  Download,
  TrendingUp,
  Clock,
  MapPin,
  BarChart3,
  PieChartIcon,
  Activity,
  Monitor,
  Wifi,
  Zap,
  Calendar,
} from "lucide-react"
import { useAssetContext } from "@/lib/asset-context"
import { format, subMonths, startOfMonth, endOfMonth, parseISO, isWithinInterval } from "date-fns"
import type { DateRange } from "react-day-picker"
import { toast } from "@/components/ui/use-toast"

// Enhanced color palette for better visual appeal
const ENHANCED_COLORS = [
  "#ea580c", // Primary orange
  "#3b82f6", // Blue
  "#10b981", // Green
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Purple
  "#06b6d4", // Cyan
  "#84cc16", // Lime
]

const GRADIENT_COLORS = [
  { start: "#ea580c", end: "#fb923c" },
  { start: "#3b82f6", end: "#60a5fa" },
  { start: "#10b981", end: "#34d399" },
  { start: "#f59e0b", end: "#fbbf24" },
]

interface ReportFilters {
  dateRange: DateRange | undefined
  location: string
  category: string
  reportType: string
}

// Custom tooltip component for better styling
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-3">
        <p className="font-medium text-foreground">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function ReportsDashboard() {
  const { assets, masterAssets, categories, locations, sections, subSections, zones } = useAssetContext()
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: {
      from: subMonths(new Date(), 6),
      to: new Date(),
    },
    location: "all",
    category: "all",
    reportType: "overview",
  })

  const reportData = useMemo(() => {
    // Filter assets based on selected criteria
    let filteredAssets = assets

    if (filters.location !== "all") {
      filteredAssets = filteredAssets.filter((asset) => asset.locationId === filters.location)
    }

    if (filters.category !== "all") {
      filteredAssets = filteredAssets.filter((asset) => {
        const masterAsset = masterAssets.find((ma) => ma.id === asset.masterAssetId)
        return masterAsset?.categoryId === filters.category
      })
    }

    // Digital signage specific metrics
    const digitalSignageMetrics = {
      totalScreens: filteredAssets.filter((asset) => {
        const masterAsset = masterAssets.find((ma) => ma.id === asset.masterAssetId)
        const category = categories.find((cat) => cat.id === masterAsset?.categoryId)
        return category?.name.toLowerCase().includes("display") || category?.name.toLowerCase().includes("screen")
      }).length,
      totalMediaPlayers: filteredAssets.filter((asset) => {
        const masterAsset = masterAssets.find((ma) => ma.id === asset.masterAssetId)
        const category = categories.find((cat) => cat.id === masterAsset?.categoryId)
        return category?.name.toLowerCase().includes("player") || category?.name.toLowerCase().includes("media")
      }).length,
      connectedAssets: filteredAssets.filter((asset) => asset.ipAddress).length,
      averageBrightness:
        filteredAssets.reduce((sum, asset) => sum + (asset.brightnessLevel || 0), 0) / filteredAssets.length || 0,
    }

    // Resolution distribution for displays
    const resolutionDistribution = masterAssets
      .filter((ma) => ma.resolution)
      .reduce(
        (acc, ma) => {
          const count = filteredAssets.filter((asset) => asset.masterAssetId === ma.id).length
          if (count > 0) {
            acc[ma.resolution!] = (acc[ma.resolution!] || 0) + count
          }
          return acc
        },
        {} as Record<string, number>,
      )

    const resolutionData = Object.entries(resolutionDistribution).map(([resolution, count]) => ({
      name: resolution,
      value: count,
      percentage: Math.round((count / filteredAssets.length) * 100),
    }))

    // Operating hours analysis
    const operatingHoursData = filteredAssets
      .filter((asset) => asset.operatingHours)
      .reduce(
        (acc, asset) => {
          const hours = asset.operatingHours!
          acc[hours] = (acc[hours] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

    const operatingHoursChart = Object.entries(operatingHoursData).map(([hours, count]) => ({
      hours,
      count,
      percentage: Math.round((count / filteredAssets.length) * 100),
    }))

    // Network connectivity status
    const connectivityData = [
      {
        name: "Connected",
        value: filteredAssets.filter((asset) => asset.ipAddress).length,
        color: ENHANCED_COLORS[2],
      },
      {
        name: "Not Connected",
        value: filteredAssets.filter((asset) => !asset.ipAddress).length,
        color: ENHANCED_COLORS[4],
      },
    ]

    // Asset distribution by category
    const categoryDistribution = categories
      .map((category) => {
        const categoryAssets = filteredAssets.filter((asset) => {
          const masterAsset = masterAssets.find((ma) => ma.id === asset.masterAssetId)
          return masterAsset?.categoryId === category.id
        })
        return {
          name: category.name,
          value: categoryAssets.length,
          percentage: filteredAssets.length > 0 ? Math.round((categoryAssets.length / filteredAssets.length) * 100) : 0,
          color: ENHANCED_COLORS[categories.indexOf(category) % ENHANCED_COLORS.length],
        }
      })
      .filter((item) => item.value > 0)

    // Location distribution with enhanced styling
    const locationDistribution = locations
      .map((location, index) => {
        const locationAssets = filteredAssets.filter((asset) => asset.locationId === location.id)
        return {
          name: location.name,
          value: locationAssets.length,
          percentage: filteredAssets.length > 0 ? Math.round((locationAssets.length / filteredAssets.length) * 100) : 0,
          fill: ENHANCED_COLORS[index % ENHANCED_COLORS.length],
        }
      })
      .filter((item) => item.value > 0)

    // Enhanced maintenance trends with cost simulation
    const maintenanceTrends = Array.from({ length: 12 }, (_, i) => {
      const date = subMonths(new Date(), 11 - i)
      const monthStart = startOfMonth(date)
      const monthEnd = endOfMonth(date)
      const monthName = format(date, "MMM yyyy")

      const maintenanceCount = filteredAssets.filter((asset) => {
        if (!asset.lastMaintenanceDate) return false
        const maintenanceDate = parseISO(asset.lastMaintenanceDate)
        return isWithinInterval(maintenanceDate, { start: monthStart, end: monthEnd })
      }).length

      // Enhanced cost calculation based on asset types
      const cost = maintenanceCount * (Math.random() * 800 + 300)
      const efficiency = Math.max(60, 100 - maintenanceCount * 5 + Math.random() * 20)

      return {
        month: monthName,
        maintenance: maintenanceCount,
        cost: Math.round(cost),
        efficiency: Math.round(efficiency),
        trend:
          i > 0 ? (maintenanceCount > (Array.from({ length: i }, (_, j) => j).pop() || 0) ? "up" : "down") : "stable",
      }
    })

    // Power consumption analysis
    const powerConsumptionData = masterAssets
      .filter((ma) => ma.powerConsumption)
      .map((ma) => {
        const assetCount = filteredAssets.filter((asset) => asset.masterAssetId === ma.id).length
        return {
          name: ma.name,
          powerPerUnit: ma.powerConsumption!,
          totalPower: ma.powerConsumption! * assetCount,
          count: assetCount,
        }
      })
      .filter((item) => item.count > 0)
      .sort((a, b) => b.totalPower - a.totalPower)

    // ... existing code for other analyses ...

    // Asset age analysis
    const currentDate = new Date()
    const ageDistribution = [
      { range: "0-1 years", count: 0, color: ENHANCED_COLORS[2] },
      { range: "1-3 years", count: 0, color: ENHANCED_COLORS[1] },
      { range: "3-5 years", count: 0, color: ENHANCED_COLORS[3] },
      { range: "5+ years", count: 0, color: ENHANCED_COLORS[4] },
    ]

    filteredAssets.forEach((asset) => {
      const purchaseDate = parseISO(asset.purchaseDate)
      const ageInYears = (currentDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365)

      if (ageInYears <= 1) ageDistribution[0].count++
      else if (ageInYears <= 3) ageDistribution[1].count++
      else if (ageInYears <= 5) ageDistribution[2].count++
      else ageDistribution[3].count++
    })

    // Warranty status analysis
    const warrantyAnalysis = {
      active: filteredAssets.filter((asset) => new Date(asset.warrantyEndDate) > currentDate).length,
      expiringSoon: filteredAssets.filter((asset) => {
        const endDate = new Date(asset.warrantyEndDate)
        const threeMonthsFromNow = new Date()
        threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3)
        return endDate > currentDate && endDate <= threeMonthsFromNow
      }).length,
      expired: filteredAssets.filter((asset) => new Date(asset.warrantyEndDate) <= currentDate).length,
    }

    // Maintenance status analysis
    const maintenanceAnalysis = {
      overdue: filteredAssets.filter((asset) => {
        if (!asset.nextMaintenanceDate) return false
        return new Date(asset.nextMaintenanceDate) < currentDate
      }).length,
      dueSoon: filteredAssets.filter((asset) => {
        if (!asset.nextMaintenanceDate) return false
        const dueDate = new Date(asset.nextMaintenanceDate)
        const oneMonthFromNow = new Date()
        oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1)
        return dueDate >= currentDate && dueDate <= oneMonthFromNow
      }).length,
      upToDate: filteredAssets.filter((asset) => {
        if (!asset.nextMaintenanceDate) return true
        const dueDate = new Date(asset.nextMaintenanceDate)
        const oneMonthFromNow = new Date()
        oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1)
        return dueDate > oneMonthFromNow
      }).length,
    }

    // Enhanced utilization analysis
    const utilizationData = filteredAssets
      .map((asset) => {
        const masterAsset = masterAssets.find((ma) => ma.id === asset.masterAssetId)
        const location = locations.find((loc) => loc.id === asset.locationId)
        return {
          id: asset.id,
          name: masterAsset?.name || "Unknown",
          location: location?.name || "Unknown",
          timeSpent: asset.timeSpentMinutes || 0,
          utilization: Math.min(100, ((asset.timeSpentMinutes || 0) / (30 * 24 * 60)) * 100),
          ipAddress: asset.ipAddress,
          operatingHours: asset.operatingHours,
          brightness: asset.brightnessLevel,
        }
      })
      .sort((a, b) => b.utilization - a.utilization)

    return {
      totalAssets: filteredAssets.length,
      digitalSignageMetrics,
      categoryDistribution,
      locationDistribution,
      maintenanceTrends,
      ageDistribution,
      warrantyAnalysis,
      maintenanceAnalysis,
      utilizationData: utilizationData.slice(0, 10),
      resolutionData,
      operatingHoursChart,
      connectivityData,
      powerConsumptionData: powerConsumptionData.slice(0, 8),
    }
  }, [assets, masterAssets, categories, locations, filters])

  const handleExportReport = async (format: "pdf" | "excel" | "csv") => {
    const reportName = `Digital_Signage_Report_${format.toUpperCase()}_${format(new Date(), "yyyy-MM-dd")}`

    if (format === "csv") {
      const csvData = [
        ["Digital Signage Asset Report"],
        ["Generated On", format(new Date(), "yyyy-MM-dd HH:mm:ss")],
        [""],
        ["Summary Metrics"],
        ["Total Assets", reportData.totalAssets.toString()],
        ["Total Screens", reportData.digitalSignageMetrics.totalScreens.toString()],
        ["Total Media Players", reportData.digitalSignageMetrics.totalMediaPlayers.toString()],
        ["Connected Assets", reportData.digitalSignageMetrics.connectedAssets.toString()],
        ["Average Brightness", `${reportData.digitalSignageMetrics.averageBrightness.toFixed(1)}%`],
        [""],
        ["Category Distribution"],
        ["Category", "Count", "Percentage"],
        ...reportData.categoryDistribution.map((item) => [item.name, item.value.toString(), `${item.percentage}%`]),
        [""],
        ["Location Distribution"],
        ["Location", "Count", "Percentage"],
        ...reportData.locationDistribution.map((item) => [item.name, item.value.toString(), `${item.percentage}%`]),
        [""],
        ["Resolution Distribution"],
        ["Resolution", "Count", "Percentage"],
        ...reportData.resolutionData.map((item) => [item.name, item.value.toString(), `${item.percentage}%`]),
        [""],
        ["Power Consumption Analysis"],
        ["Asset Type", "Power per Unit (W)", "Total Power (W)", "Asset Count"],
        ...reportData.powerConsumptionData.map((item) => [
          item.name,
          item.powerPerUnit.toString(),
          item.totalPower.toString(),
          item.count.toString(),
        ]),
        [""],
        ["Top Utilized Assets"],
        ["Asset Name", "Location", "Utilization %", "Time Spent (min)", "IP Address", "Operating Hours"],
        ...reportData.utilizationData.map((item) => [
          item.name,
          item.location,
          `${item.utilization.toFixed(1)}%`,
          item.timeSpent.toString(),
          item.ipAddress || "Not set",
          item.operatingHours || "Not set",
        ]),
      ]

      const csvString = csvData.map((row) => row.join(",")).join("\n")
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `${reportName}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "CSV Export Complete",
        description: `${reportName}.csv has been downloaded successfully.`,
      })
    } else if (format === "excel") {
      // Simulate Excel export with enhanced data structure
      const excelData = {
        summary: reportData.digitalSignageMetrics,
        categories: reportData.categoryDistribution,
        locations: reportData.locationDistribution,
        utilization: reportData.utilizationData,
        maintenance: reportData.maintenanceTrends,
        power: reportData.powerConsumptionData,
      }

      // In a real implementation, you would use a library like SheetJS
      const jsonString = JSON.stringify(excelData, null, 2)
      const blob = new Blob([jsonString], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `${reportName}.json`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Excel Export Complete",
        description: `${reportName} data has been exported successfully.`,
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Digital Signage Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive reporting and insights for your digital signage network</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleExportReport("csv")}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => handleExportReport("excel")}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Report Filters */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Report Filters
          </CardTitle>
          <CardDescription>Customize your digital signage report parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <DatePickerWithRange
                date={filters.dateRange}
                onDateChange={(dateRange) => setFilters({ ...filters, dateRange })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <Select value={filters.location} onValueChange={(value) => setFilters({ ...filters, location: value })}>
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
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
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
            <div>
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Select
                value={filters.reportType}
                onValueChange={(value) => setFilters({ ...filters, reportType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview Report</SelectItem>
                  <SelectItem value="maintenance">Maintenance Report</SelectItem>
                  <SelectItem value="performance">Performance Report</SelectItem>
                  <SelectItem value="connectivity">Connectivity Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-l-4 border-l-primary">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -mr-10 -mt-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Digital Assets</CardTitle>
            <Monitor className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{reportData.totalAssets}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              {reportData.digitalSignageMetrics.totalScreens} screens,{" "}
              {reportData.digitalSignageMetrics.totalMediaPlayers} players
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-green-500">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -mr-10 -mt-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Connected</CardTitle>
            <Wifi className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{reportData.digitalSignageMetrics.connectedAssets}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((reportData.digitalSignageMetrics.connectedAssets / reportData.totalAssets) * 100)}%
              connectivity rate
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-amber-500">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full -mr-10 -mt-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Brightness</CardTitle>
            <Zap className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">
              {reportData.digitalSignageMetrics.averageBrightness.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">Display brightness level</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-blue-500">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Due</CardTitle>
            <Calendar className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{reportData.maintenanceAnalysis.dueSoon}</div>
            <p className="text-xs text-muted-foreground">{reportData.maintenanceAnalysis.overdue} overdue</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Report Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="connectivity">Connectivity</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-primary" />
                  Asset Distribution by Category
                </CardTitle>
                <CardDescription>Digital signage equipment breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={reportData.categoryDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} (${percentage}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={800}
                    >
                      {reportData.categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-blue-600" />
                  Display Resolution Distribution
                </CardTitle>
                <CardDescription>Screen resolution breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={reportData.resolutionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                    <YAxis stroke="hsl(var(--foreground))" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} animationDuration={1000} />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={ENHANCED_COLORS[1]} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={ENHANCED_COLORS[1]} stopOpacity={0.3} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-600" />
                Geographic Distribution
              </CardTitle>
              <CardDescription>Assets across different locations in India</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={reportData.locationDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                  <YAxis stroke="hsl(var(--foreground))" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="url(#locationGradient)" radius={[6, 6, 0, 0]} animationDuration={1200} />
                  <defs>
                    <linearGradient id="locationGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={ENHANCED_COLORS[2]} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={ENHANCED_COLORS[2]} stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  Power Consumption Analysis
                </CardTitle>
                <CardDescription>Energy usage by asset type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={reportData.powerConsumptionData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--foreground))" />
                    <YAxis dataKey="name" type="category" stroke="hsl(var(--foreground))" width={100} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="totalPower"
                      fill="url(#powerGradient)"
                      radius={[0, 4, 4, 0]}
                      animationDuration={1000}
                    />
                    <defs>
                      <linearGradient id="powerGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="5%" stopColor={ENHANCED_COLORS[5]} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={ENHANCED_COLORS[5]} stopOpacity={0.3} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  Operating Hours Distribution
                </CardTitle>
                <CardDescription>Asset operating schedule patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={reportData.operatingHoursChart}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="count"
                      animationBegin={0}
                      animationDuration={800}
                    >
                      {reportData.operatingHoursChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={ENHANCED_COLORS[index % ENHANCED_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="connectivity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-l-4 border-l-cyan-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="h-5 w-5 text-cyan-600" />
                  Network Connectivity Status
                </CardTitle>
                <CardDescription>Digital signage network health</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="20%"
                    outerRadius="90%"
                    data={reportData.connectivityData}
                  >
                    <RadialBar
                      minAngle={15}
                      label={{ position: "insideStart", fill: "#fff" }}
                      background
                      clockWise
                      dataKey="value"
                      animationDuration={1000}
                    />
                    <Legend iconSize={18} layout="vertical" verticalAlign="middle" align="right" />
                    <Tooltip content={<CustomTooltip />} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-indigo-500">
              <CardHeader>
                <CardTitle>Top Performing Assets</CardTitle>
                <CardDescription>Highest utilization digital signage assets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.utilizationData.slice(0, 5).map((asset, index) => (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-background to-muted/30 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{asset.name}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {asset.location}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-primary">{asset.utilization.toFixed(1)}%</p>
                        <p className="text-sm text-muted-foreground">{asset.timeSpent}min</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-amber-600" />
                Maintenance Trends & Efficiency
              </CardTitle>
              <CardDescription>Monthly maintenance activities and system efficiency</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={reportData.maintenanceTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
                  <YAxis yAxisId="left" stroke="hsl(var(--foreground))" />
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--foreground))" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="maintenance"
                    fill="url(#maintenanceGradient)"
                    name="Maintenance Count"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1000}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="efficiency"
                    stroke={ENHANCED_COLORS[2]}
                    strokeWidth={3}
                    name="Efficiency %"
                    dot={{ fill: ENHANCED_COLORS[2], strokeWidth: 2, r: 6 }}
                    animationDuration={1200}
                  />
                  <defs>
                    <linearGradient id="maintenanceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={ENHANCED_COLORS[3]} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={ENHANCED_COLORS[3]} stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
