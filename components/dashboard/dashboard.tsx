"use client"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import AssetManagement from "@/components/asset-management"
import ReportsDashboard from "@/components/reports/reports-dashboard"
import AssetMap from "@/components/maps/asset-map"
import Settings from "@/components/settings/settings"
import { useAssetContext } from "@/lib/asset-context"
import { createClient } from "@/lib/supabase/client"
import {
  LayoutDashboard,
  Package,
  MapPin,
  BarChart3,
  SettingsIcon,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  LogOut,
} from "lucide-react"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"

const COLORS = [
  "#FF6B6B", // Coral Red
  "#4ECDC4", // Turquoise
  "#45B7D1", // Sky Blue
  "#96CEB4", // Mint Green
  "#FFEAA7", // Warm Yellow
  "#DDA0DD", // Plum
  "#98D8C8", // Seafoam
  "#F7DC6F", // Light Gold
]

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "assets", label: "Asset Management", icon: Package },
  { id: "reports", label: "Reports & Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: SettingsIcon },
]

export default function Dashboard() {
  const [activeView, setActiveView] = useState("dashboard")
  const { assets, categories, locations, sections, subSections, zones, user } = useAssetContext()
  const supabase = createClient()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/auth/login")
      router.refresh()
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  const getUserInitials = () => {
    if (!user?.email) return "U"
    const email = user.email
    const parts = email.split("@")[0].split(".")
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return email[0].toUpperCase()
  }

  const analytics = useMemo(() => {
    const totalAssets = assets.length
    const assetsWithMaintenance = assets.filter((asset) => asset.lastMaintenanceDate).length
    const overdueAssets = assets.filter((asset) => {
      if (!asset.nextMaintenanceDate) return false
      return new Date(asset.nextMaintenanceDate) < new Date()
    }).length

    const totalMaintenanceTime = assets.reduce((sum, asset) => sum + (asset.timeSpentMinutes || 0), 0)
    const avgMaintenanceTime = totalAssets > 0 ? Math.round(totalMaintenanceTime / totalAssets) : 0

    const categoryDistribution = categories
      .map((category) => {
        const categoryAssets = assets.filter((asset) => asset.categoryId === category.id)
        return {
          name: category.name,
          value: categoryAssets.length,
          percentage: totalAssets > 0 ? Math.round((categoryAssets.length / totalAssets) * 100) : 0,
        }
      })
      .filter((item) => item.value > 0)

    const locationDistribution = assets.reduce(
      (acc, asset) => {
        if (asset.coordinates && asset.coordinates.lat && asset.coordinates.lng) {
          const locationKey =
            asset.location || `${asset.coordinates.lat.toFixed(2)}, ${asset.coordinates.lng.toFixed(2)}`
          const existing = acc.find((item) => item.name === locationKey)
          if (existing) {
            existing.value += 1
          } else {
            acc.push({
              name: locationKey,
              value: 1,
              percentage: 0, // Will be calculated after
            })
          }
        }
        return acc
      },
      [] as Array<{ name: string; value: number; percentage: number }>,
    )

    locationDistribution.forEach((item) => {
      item.percentage = totalAssets > 0 ? Math.round((item.value / totalAssets) * 100) : 0
    })

    const maintenanceTimeline = Array.from({ length: 6 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (5 - i))
      const monthName = date.toLocaleDateString("en-US", { month: "short" })

      const maintenanceCount = Math.floor(Math.random() * 10) + 5
      const cost = Math.floor(Math.random() * 5000) + 2000

      return {
        month: monthName,
        maintenance: maintenanceCount,
        cost: cost,
      }
    })

    const currentDate = new Date()
    const warrantyStatus = {
      active: assets.filter((asset) => {
        if (!asset.warrantyStartDate || !asset.warrantyPeriodMonths) return false
        const warrantyEnd = new Date(asset.warrantyStartDate)
        warrantyEnd.setMonth(warrantyEnd.getMonth() + asset.warrantyPeriodMonths)
        return warrantyEnd > currentDate
      }).length,
      expiringSoon: assets.filter((asset) => {
        if (!asset.warrantyStartDate || !asset.warrantyPeriodMonths) return false
        const warrantyEnd = new Date(asset.warrantyStartDate)
        warrantyEnd.setMonth(warrantyEnd.getMonth() + asset.warrantyPeriodMonths)
        const threeMonthsFromNow = new Date()
        threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3)
        return warrantyEnd > currentDate && warrantyEnd <= threeMonthsFromNow
      }).length,
      expired: assets.filter((asset) => {
        if (!asset.warrantyStartDate || !asset.warrantyPeriodMonths) return false
        const warrantyEnd = new Date(asset.warrantyStartDate)
        warrantyEnd.setMonth(warrantyEnd.getMonth() + asset.warrantyPeriodMonths)
        return warrantyEnd <= currentDate
      }).length,
    }

    return {
      totalAssets,
      assetsWithMaintenance,
      overdueAssets,
      avgMaintenanceTime,
      categoryDistribution,
      locationDistribution,
      maintenanceTimeline,
      warrantyStatus,
    }
  }, [assets, categories, locations])

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Digital Signage Asset Management Overview</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalAssets}</div>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Expired Warranty</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{analytics.warrantyStatus.expired}</div>
                  <p className="text-xs text-muted-foreground">Assets need warranty renewal</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overdue Maintenance</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{analytics.overdueAssets}</div>
                  <p className="text-xs text-muted-foreground">Requires immediate attention</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Warranty Expiring Soon</CardTitle>
                  <Clock className="h-4 w-4 text-amber-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">{analytics.warrantyStatus.expiringSoon}</div>
                  <p className="text-xs text-muted-foreground">Within next 3 months</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Asset Locations Map
                </CardTitle>
                <CardDescription>Geographic distribution of your digital signage assets across India</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <AssetMap />
              </CardContent>
            </Card>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                <TabsTrigger value="warranty">Warranty</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Asset Distribution by Category</CardTitle>
                      <CardDescription>Breakdown of assets across different categories</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {analytics.categoryDistribution.length > 0 ? (
                        <div className="relative">
                          <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                              <defs>
                                {COLORS.map((color, index) => (
                                  <linearGradient
                                    key={`gradient-${index}`}
                                    id={`gradient-${index}`}
                                    x1="0%"
                                    y1="0%"
                                    x2="100%"
                                    y2="100%"
                                  >
                                    <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                                    <stop offset="100%" stopColor={color} stopOpacity={1} />
                                  </linearGradient>
                                ))}
                              </defs>
                              <Pie
                                data={analytics.categoryDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={false}
                                outerRadius={120}
                                innerRadius={60}
                                fill="#8884d8"
                                dataKey="value"
                                animationBegin={0}
                                animationDuration={1000}
                                stroke="white"
                                strokeWidth={3}
                              >
                                {analytics.categoryDistribution.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={`url(#gradient-${index % COLORS.length})`}
                                    style={{
                                      filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))",
                                      cursor: "pointer",
                                    }}
                                  />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "hsl(var(--background))",
                                  border: "1px solid hsl(var(--border))",
                                  borderRadius: "8px",
                                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                                  fontSize: "14px",
                                }}
                                formatter={(value, name) => [
                                  `${value} assets (${Math.round((value / analytics.totalAssets) * 100)}%)`,
                                  name,
                                ]}
                              />
                            </PieChart>
                          </ResponsiveContainer>

                          <div className="absolute top-4 right-4 space-y-2">
                            {analytics.categoryDistribution.map((entry, index) => (
                              <div key={entry.name} className="flex items-center gap-2 text-sm">
                                <div
                                  className="w-3 h-3 rounded-full shadow-sm"
                                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <span className="font-medium">{entry.name}</span>
                                <span className="text-muted-foreground">({entry.percentage}%)</span>
                              </div>
                            ))}
                          </div>

                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-foreground">{analytics.totalAssets}</div>
                              <div className="text-sm text-muted-foreground font-medium">Total Assets</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                          <div className="text-center">
                            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No assets found</p>
                            <p className="text-sm">Add assets to see distribution</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Location Distribution</CardTitle>
                      <CardDescription>Assets across different coordinate locations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {analytics.locationDistribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={analytics.locationDistribution}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="hsl(var(--primary))" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                          <div className="text-center">
                            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No location data found</p>
                            <p className="text-sm">Add coordinates to assets to see distribution</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="maintenance" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Maintenance Timeline</CardTitle>
                      <CardDescription>Monthly maintenance activities and costs</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={analytics.maintenanceTimeline}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Area
                            type="monotone"
                            dataKey="maintenance"
                            stroke="hsl(var(--primary))"
                            fill="hsl(var(--primary))"
                            fillOpacity={0.3}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Maintenance Costs</CardTitle>
                      <CardDescription>Monthly maintenance expenditure</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics.maintenanceTimeline}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`$${value}`, "Cost"]} />
                          <Line type="monotone" dataKey="cost" stroke="hsl(var(--accent))" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="warranty" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Warranties</CardTitle>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{analytics.warrantyStatus.active}</div>
                      <p className="text-xs text-muted-foreground">Assets under warranty</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-amber-600">{analytics.warrantyStatus.expiringSoon}</div>
                      <p className="text-xs text-muted-foreground">Within 3 months</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Expired</CardTitle>
                      <Clock className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">{analytics.warrantyStatus.expired}</div>
                      <p className="text-xs text-muted-foreground">Need renewal</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="locations" className="space-y-6">
                <div className="grid gap-6">
                  {locations.map((location) => {
                    const locationAssets = assets.filter((asset) => asset.locationId === location.id)
                    const locationSections = sections.filter((section) => section.locationId === location.id)

                    return (
                      <Card key={location.id} className="dashboard-card">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            {location.name}
                          </CardTitle>
                          <CardDescription>
                            {locationAssets.length} assets across {locationSections.length} sections
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {locationSections.map((section) => {
                              const sectionAssets = assets.filter((asset) => asset.sectionId === section.id)
                              return (
                                <div key={section.id} className="p-3 bg-muted/50 rounded-lg">
                                  <h4 className="font-medium">{section.name}</h4>
                                  <p className="text-sm text-muted-foreground">{sectionAssets.length} assets</p>
                                  <Progress
                                    value={(sectionAssets.length / locationAssets.length) * 100}
                                    className="mt-2 h-2"
                                  />
                                </div>
                              )
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )
      case "assets":
        return <AssetManagement />
      case "reports":
        return <ReportsDashboard />
      case "settings":
        return <Settings />
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-muted-foreground">Coming Soon</h2>
              <p className="text-muted-foreground mt-2">This feature is under development</p>
            </div>
          </div>
        )
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r">
          <SidebarHeader className="border-b p-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Package className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">UneTrack</h2>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-4">
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveView(item.id)}
                    isActive={activeView === item.id}
                    className="w-full justify-start"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-6">
              <SidebarTrigger className="mr-4" />
              <div className="ml-auto flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">Account</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email || "user@example.com"}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
          <main className="flex-1 p-6">{renderContent()}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
