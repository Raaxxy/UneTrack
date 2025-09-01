// Asset Categories
export interface AssetCategory {
  id: string
  name: string
  description: string | null
}

export interface Asset {
  id: string
  // Basic asset information
  name: string
  categoryId: string
  assetLocation: string
  googleLocation?: string
  latitude?: number
  longitude?: number
  manufacturer: string
  modelNumber: string
  screenSize: string
  customScreenSize?: number
  resolution: string
  customResolution?: string
  powerConsumption: number
  operatingSystem: string
  description: string

  // Warranty information
  purchaseDate: string
  installationDate: string
  warrantyStartDate: string
  warrantyPeriodMonths: number

  // Digital signage configuration
  macAddress: string
  contentManagementSystem: string
  displayOrientation: "Landscape" | "Portrait"
  operatingHours: number // 1-24 hours

  // Legacy fields for backward compatibility
  locationId?: string
  sectionId?: string
  subSectionId?: string
  zoneId?: string
  serialNumber?: string
  barcode?: string
  warrantyEndDate?: string
  timeSpentMinutes?: number
  lastMaintenanceDate?: string | null
  maintenanceScheduleId?: string | null
  nextMaintenanceDate?: string | null
  ipAddress?: string
  brightnessLevel?: number
  coordinates?: {
    latitude: number
    longitude: number
  }
}

// Location hierarchy
export interface Location {
  id: string
  name: string
}

export interface Section {
  id: string
  name: string
  locationId: string
}

export interface SubSection {
  id: string
  name: string
  sectionId: string
}

export interface Zone {
  id: string
  name: string
  subSectionId: string
}

// Maintenance Schedule
export interface MaintenanceSchedule {
  id: string
  name: string
  intervalValue: number
  intervalUnit: "hour" | "day" | "week" | "month" | "year"
  serviceType: string
}

// Maintenance Status
export type MaintenanceStatus =
  | "overdue"
  | "due_today"
  | "due_this_week"
  | "due_this_month"
  | "due_next_30_days"
  | "upcoming"
  | "no_maintenance"
