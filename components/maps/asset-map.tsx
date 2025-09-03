"use client"

import { useEffect, useRef } from "react"

interface Asset {
  id: string
  name: string
  latitude?: number
  longitude?: number
  category_id?: string
  asset_location?: string
}

interface AssetMapProps {
  assets: Asset[]
}

export default function AssetMap({ assets }: AssetMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const initializeMap = async () => {
      try {
        // Import Leaflet CSS first
        const leafletCSS = document.createElement('link')
        leafletCSS.rel = 'stylesheet'
        leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        leafletCSS.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
        leafletCSS.crossOrigin = ''
        document.head.appendChild(leafletCSS)

        // Wait a bit for CSS to load
        await new Promise(resolve => setTimeout(resolve, 100))

        const L = await import("leaflet")

        // Fix for default markers
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        })

        // Create map with India focus
        const map = L.map(mapRef.current!, {
          center: [20.5937, 78.9629], // Center of India
          zoom: 5,
          zoomControl: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          boxZoom: true,
          keyboard: true,
          dragging: true,
          touchZoom: true,
        })

        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 18,
          minZoom: 4,
        }).addTo(map)

        // Set India bounds
        const indiaBounds = L.latLngBounds(
          [6.4627, 68.1097], // Southwest
          [35.5137, 97.3953], // Northeast
        )

        map.setMaxBounds(indiaBounds)
        map.fitBounds(indiaBounds, { padding: [20, 20] })

        mapInstanceRef.current = map

        // Add assets as markers
        updateMarkers(L, map)

      } catch (error) {
        console.error("Map initialization failed:", error)
      }
    }

    const updateMarkers = (L: any, map: any) => {
      // Clear existing markers
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []

      // Add new markers
      const validAssets = assets.filter(
        (asset) => asset.latitude && asset.longitude && 
        !isNaN(asset.latitude) && !isNaN(asset.longitude)
      )

      validAssets.forEach((asset) => {
        const marker = L.marker([asset.latitude!, asset.longitude!])
          .bindPopup(`
            <div style="padding: 8px; font-family: system-ui;">
              <h3 style="margin: 0 0 4px 0; font-weight: 600; font-size: 14px;">${asset.name}</h3>
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${asset.asset_location || "Location not specified"}</p>
              <p style="margin: 0; font-size: 11px; color: #999;">Lat: ${asset.latitude}, Lng: ${asset.longitude}</p>
            </div>
          `)
          .addTo(map)

        markersRef.current.push(marker)
      })
    }

    initializeMap()

    return () => {
      if (mapInstanceRef.current) {
        markersRef.current.forEach((marker) => marker.remove())
        markersRef.current = []
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [assets]) // Include assets in dependencies

  return (
    <div className="w-full h-full flex flex-col">
      <div
        ref={mapRef}
        className="w-full h-96 rounded-lg border border-border bg-muted/20 shadow-sm"
        style={{ minHeight: "400px" }}
      />

      <div className="mt-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
        <h4 className="font-semibold text-base text-gray-800 mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Map Legend
        </h4>
        <div className="flex items-center gap-8 text-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-md transform rotate-45" style={{borderRadius: '50% 50% 50% 0'}}></div>
              <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2 -rotate-45"></div>
            </div>
            <span className="text-gray-700 font-medium">Asset Locations</span>
          </div>
          <div className="flex items-center gap-3 text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">Click markers for details</span>
          </div>
        </div>
      </div>
    </div>
  )
}