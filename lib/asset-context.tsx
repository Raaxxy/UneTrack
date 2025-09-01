"use client"

import { createContext, useContext, type ReactNode, useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type {
  AssetCategory,
  MasterAsset,
  Asset,
  Location,
  Section,
  SubSection,
  Zone,
  MaintenanceSchedule,
} from "@/lib/types"

interface AssetContextType {
  categories: AssetCategory[]
  setCategories: (categories: AssetCategory[]) => void
  addCategory: (category: AssetCategory) => Promise<void>
  masterAssets: MasterAsset[]
  setMasterAssets: (masterAssets: MasterAsset[]) => void
  updateMasterAsset: (masterAsset: MasterAsset) => void
  assets: Asset[]
  setAssets: (assets: Asset[]) => void
  addAsset: (asset: Asset) => Promise<void>
  updateAsset: (asset: Asset) => Promise<void>
  locations: Location[]
  sections: Section[]
  subSections: SubSection[]
  zones: Zone[]
  maintenanceSchedules: MaintenanceSchedule[]
  addMaintenanceSchedule: (schedule: MaintenanceSchedule) => void
  updateMaintenanceSchedule: (schedule: MaintenanceSchedule) => void
  deleteMaintenanceSchedule: (id: string) => void
  loading: boolean
  user: any
}

const AssetContext = createContext<AssetContextType | undefined>(undefined)

export function AssetProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  const [categories, setCategories] = useState<AssetCategory[]>([])
  const [masterAssets, setMasterAssets] = useState<MasterAsset[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [locations] = useState<Location[]>([])
  const [sections] = useState<Section[]>([])
  const [subSections] = useState<SubSection[]>([])
  const [zones] = useState<Zone[]>([])
  const [maintenanceSchedules, setMaintenanceSchedules] = useState<MaintenanceSchedule[]>([])

  useEffect(() => {
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      if (session?.user) {
        loadData()
      } else {
        setLoading(false)
      }
    }

    getInitialSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadData()
      } else {
        setCategories([])
        setAssets([])
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      const { data: categoriesData, error: categoriesError } = await supabase
        .from("asset_categories")
        .select("*")
        .order("name")

      if (categoriesError) {
        console.error("Error loading categories:", categoriesError)
      } else {
        setCategories(categoriesData || [])
      }

      const { data: assetsData, error: assetsError } = await supabase
        .from("assets")
        .select("*")
        .order("created_at", { ascending: false })

      if (assetsError) {
        console.error("Error loading assets:", assetsError)
      } else {
        setAssets(assetsData || [])
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const addAsset = async (asset: Asset) => {
    if (!user) {
      throw new Error("User must be authenticated to add assets")
    }

    try {
      const { data, error } = await supabase
        .from("assets")
        .insert([
          {
            name: asset.name,
            category_id: asset.categoryId,
            asset_location: asset.assetLocation,
            google_location: asset.googleLocation,
            latitude: asset.latitude,
            longitude: asset.longitude,
            manufacturer: asset.manufacturer,
            model_number: asset.modelNumber,
            screen_size: asset.screenSize,
            custom_screen_size: asset.customScreenSize,
            resolution: asset.resolution,
            custom_resolution: asset.customResolution,
            power_consumption: asset.powerConsumption,
            operating_system: asset.operatingSystem,
            description: asset.description,
            purchase_date: asset.purchaseDate,
            installation_date: asset.installationDate,
            warranty_start_date: asset.warrantyStartDate,
            warranty_period_months: asset.warrantyPeriodMonths,
            mac_address: asset.macAddress,
            content_management_system: asset.contentManagementSystem,
            display_orientation: asset.displayOrientation,
            operating_hours: asset.operatingHours,
            status: asset.status || "active",
            user_id: user.id,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("Error adding asset:", error)
        throw error
      }

      setAssets((prev) => [data, ...prev])
    } catch (error) {
      console.error("Error adding asset:", error)
      throw error
    }
  }

  const updateAsset = async (asset: Asset) => {
    if (!user) {
      throw new Error("User must be authenticated to update assets")
    }

    try {
      const { data, error } = await supabase
        .from("assets")
        .update({
          name: asset.name,
          category_id: asset.categoryId,
          asset_location: asset.assetLocation,
          google_location: asset.googleLocation,
          latitude: asset.latitude,
          longitude: asset.longitude,
          manufacturer: asset.manufacturer,
          model_number: asset.modelNumber,
          screen_size: asset.screenSize,
          custom_screen_size: asset.customScreenSize,
          resolution: asset.resolution,
          custom_resolution: asset.customResolution,
          power_consumption: asset.powerConsumption,
          operating_system: asset.operatingSystem,
          description: asset.description,
          purchase_date: asset.purchaseDate,
          installation_date: asset.installationDate,
          warranty_start_date: asset.warrantyStartDate,
          warranty_period_months: asset.warrantyPeriodMonths,
          mac_address: asset.macAddress,
          content_management_system: asset.contentManagementSystem,
          display_orientation: asset.displayOrientation,
          operating_hours: asset.operatingHours,
          status: asset.status,
        })
        .eq("id", asset.id)
        .select()
        .single()

      if (error) {
        console.error("Error updating asset:", error)
        throw error
      }

      setAssets((prev) => prev.map((a) => (a.id === asset.id ? data : a)))
    } catch (error) {
      console.error("Error updating asset:", error)
      throw error
    }
  }

  const addCategory = async (category: AssetCategory) => {
    if (!user) {
      throw new Error("User must be authenticated to add categories")
    }

    try {
      const { data, error } = await supabase
        .from("asset_categories")
        .insert([
          {
            name: category.name,
            description: category.description,
            user_id: user.id,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("Error adding category:", error)
        throw error
      }

      setCategories((prev) => [...prev, data])
    } catch (error) {
      console.error("Error adding category:", error)
      throw error
    }
  }

  const updateMasterAsset = (masterAsset: MasterAsset) => {
    setMasterAssets(masterAssets.map((ma) => (ma.id === masterAsset.id ? masterAsset : ma)))
  }

  const addMaintenanceSchedule = (schedule: MaintenanceSchedule) => {
    const newSchedule = {
      ...schedule,
      id: (Math.max(...maintenanceSchedules.map((s) => Number(s.id)), 0) + 1).toString(),
    }
    setMaintenanceSchedules([...maintenanceSchedules, newSchedule])
  }

  const updateMaintenanceSchedule = (schedule: MaintenanceSchedule) => {
    setMaintenanceSchedules(maintenanceSchedules.map((s) => (s.id === schedule.id ? schedule : s)))
  }

  const deleteMaintenanceSchedule = (id: string) => {
    setMaintenanceSchedules(maintenanceSchedules.filter((s) => s.id !== id))
  }

  return (
    <AssetContext.Provider
      value={{
        categories,
        setCategories,
        addCategory,
        masterAssets,
        setMasterAssets,
        updateMasterAsset,
        assets,
        setAssets,
        addAsset,
        updateAsset,
        locations,
        sections,
        subSections,
        zones,
        maintenanceSchedules,
        addMaintenanceSchedule,
        updateMaintenanceSchedule,
        deleteMaintenanceSchedule,
        loading,
        user,
      }}
    >
      {children}
    </AssetContext.Provider>
  )
}

export function useAssetContext() {
  const context = useContext(AssetContext)
  if (context === undefined) {
    throw new Error("useAssetContext must be used within an AssetProvider")
  }
  return context
}
