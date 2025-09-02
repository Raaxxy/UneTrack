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
        const L = await import("leaflet")

        // Fix for default markers
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
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

        // Add beautiful tile layer
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
        const validAssets = assets.filter(
          (asset) => asset.latitude && asset.longitude && !isNaN(asset.latitude) && !isNaN(asset.longitude),
        )

        validAssets.forEach((asset) => {
          const marker = L.marker([asset.latitude!, asset.longitude!])
            .bindPopup(`
              <div class="p-2">
                <h3 class="font-semibold text-sm">${asset.name}</h3>
                <p class="text-xs text-gray-600">${asset.asset_location || "Location not specified"}</p>
                <p class="text-xs text-gray-500">Lat: ${asset.latitude}, Lng: ${asset.longitude}</p>
              </div>
            `)
            .addTo(map)

          markersRef.current.push(marker)
        })
      } catch (error) {
        console.error("Map initialization failed:", error)
      }
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
  }, []) // No dependencies to prevent re-initialization

  return (
    <div className="w-full h-full flex flex-col">
      <div
        ref={mapRef}
        className="w-full h-96 rounded-lg border border-border bg-muted/20 shadow-sm"
        style={{ minHeight: "400px" }}
      />

      <div className="mt-4 p-3 bg-card rounded-lg border border-border shadow-sm">
        <h4 className="font-medium text-sm text-foreground mb-2">Map Legend</h4>
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></div>
            <span className="text-muted-foreground">Asset Locations</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-sm shadow-sm"></div>
            <span className="text-muted-foreground">Digital Assets</span>
          </div>
        </div>
      </div>
    </div>
  )
}
