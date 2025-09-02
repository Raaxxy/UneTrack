"use client"

import { createContext, useContext, type ReactNode, useState, useEffect, useRef } from "react"
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
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current
  const isInitializedRef = useRef(false)
  const loadingDataRef = useRef(false)

  const [categories, setCategories] = useState<AssetCategory[]>([])
  const [masterAssets, setMasterAssets] = useState<MasterAsset[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [locations] = useState<Location[]>([])
  const [sections] = useState<Section[]>([])
  const [subSections] = useState<SubSection[]>([])
  const [zones] = useState<Zone[]>([])
  const [maintenanceSchedules, setMaintenanceSchedules] = useState<MaintenanceSchedule[]>([])

  useEffect(() => {
    if (isInitializedRef.current) return
    isInitializedRef.current = true

    const getInitialSession = async () => {
      try {
        console.log("[v0] Getting initial session...")

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        console.log("[v0] Session response:", { session: !!session, error })

        if (error) {
          console.error("[v0] Session error:", error)
        }

        setUser(session?.user ?? null)

        if (session?.user) {
          console.log("[v0] User authenticated, loading data...")
          await loadData()
        } else {
          console.log("[v0] No user session, setting loading to false")
          setLoading(false)
        }
      } catch (error) {
        console.error("[v0] Error getting initial session:", error)
        setLoading(false)
      }
    }

    getInitialSession()

    let authTimeout: NodeJS.Timeout
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[v0] Auth state change:", { event, hasSession: !!session })

      if (authTimeout) clearTimeout(authTimeout)

      authTimeout = setTimeout(async () => {
        const newUser = session?.user ?? null

        if (JSON.stringify(user) !== JSON.stringify(newUser)) {
          setUser(newUser)

          if (newUser) {
            console.log("[v0] User authenticated via state change, loading data...")
            await loadData()
          } else {
            console.log("[v0] No user in state change, clearing data...")
            setCategories([])
            setAssets([])
            setLoading(false)
          }
        }
      }, 100)
    })

    return () => {
      subscription.unsubscribe()
      if (authTimeout) clearTimeout(authTimeout)
    }
  }, [])

  const loadData = async () => {
    if (loadingDataRef.current) return
    loadingDataRef.current = true

    try {
      setLoading(true)
      console.log("[v0] Starting loadData function...")

      const { data: categoriesData, error: categoriesError } = await supabase
        .from("asset_categories")
        .select("*")
        .order("name")

      if (categoriesError) {
        console.error("[v0] Error loading categories:", categoriesError)
      } else {
        console.log("[v0] Categories loaded:", categoriesData?.length || 0, "categories")
        setCategories(categoriesData || [])
      }

      const { data: assetsData, error: assetsError } = await supabase
        .from("assets")
        .select("*")
        .order("created_at", { ascending: false })

      if (assetsError) {
        console.error("[v0] Error loading assets:", assetsError)
      } else {
        console.log("[v0] Assets loaded:", assetsData?.length || 0, "assets")
        console.log("[v0] Asset data sample:", assetsData?.[0])
        assetsData?.forEach((asset, index) => {
          console.log(`[v0] Asset ${index + 1}:`, {
            id: asset.id,
            name: asset.name,
            latitude: asset.latitude,
            longitude: asset.longitude,
            hasCoordinates: !!(asset.latitude && asset.longitude),
          })
        })
        setAssets(assetsData || [])
      }
    } catch (error) {
      console.error("[v0] Error loading data:", error)
    } finally {
      setLoading(false)
      loadingDataRef.current = false
    }
  }

  const addAsset = async (asset: Asset) => {
    if (!user) {
      console.log("[v0] No user authenticated for adding asset")
      throw new Error("User must be authenticated to add assets")
    }

    try {
      console.log("[v0] Adding asset:", asset)
      console.log("[v0] User:", user)

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
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("[v0] Error adding asset:", error)
        throw error
      }

      console.log("[v0] Asset added successfully:", data)
      setAssets((prev) => [data, ...prev])
    } catch (error) {
      console.error("[v0] Error adding asset:", error)
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
      console.log("[v0] No user authenticated for adding category")
      throw new Error("User must be authenticated to add categories")
    }

    try {
      console.log("[v0] Starting addCategory function")
      console.log("[v0] User authenticated:", !!user)
      console.log("[v0] User ID:", user?.id)
      console.log("[v0] Adding category:", category)
      console.log("[v0] Supabase client:", !!supabase)

      const insertData = {
        name: category.name,
        description: category.description,
      }
      console.log("[v0] Insert data:", insertData)

      const { data, error } = await supabase.from("asset_categories").insert([insertData]).select().single()

      console.log("[v0] Supabase response - data:", data)
      console.log("[v0] Supabase response - error:", error)

      if (error) {
        console.error("[v0] Database error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        })
        throw error
      }

      console.log("[v0] Category added successfully to database:", data)
      setCategories((prev) => {
        const newCategories = [...prev, data]
        console.log("[v0] Updated categories state:", newCategories)
        return newCategories
      })
      console.log("[v0] Category addition completed successfully")
    } catch (error) {
      console.error("[v0] Comprehensive error in addCategory:", {
        error,
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      })
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

  console.log("[v0] User session check:", { hasUser: !!user, userId: user?.id, userEmail: user?.email })

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
