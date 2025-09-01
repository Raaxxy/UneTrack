"use client"

import { useState, useEffect } from "react"
import { useAssetContext } from "@/lib/asset-context"

interface MapMarker {
  id: string
  position: { lat: number; lng: number }
  title: string
  type: "asset" | "location" | "zone"
  status: string
  assetCount?: number
  assetType?: string
}

export default function AssetMap() {
  const { assets, categories, locations } = useAssetContext()
  const [mapContainer, setMapContainer] = useState<HTMLDivElement | null>(null)
  const [map, setMap] = useState<any>(null)

  useEffect(() => {
    if (mapContainer && !map) {
      // Dynamically import Leaflet to avoid SSR issues
      import("leaflet").then((L) => {
        // Fix for default markers in Leaflet
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        })

        // Initialize map centered on India
        const leafletMap = L.map(mapContainer, {
          zoomControl: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          boxZoom: true,
          keyboard: true,
          dragging: true,
          touchZoom: true,
          zoomSnap: 1, // Changed from 0.1 to 1 for more noticeable zoom levels
          zoomDelta: 1, // Changed from 0.5 to 1 for more responsive scrolling
          wheelPxPerZoomLevel: 60, // Added for smoother wheel zoom
          zoomAnimation: true, // Ensure smooth zoom animations
          zoomAnimationThreshold: 4, // Animate zoom for better UX
          fadeAnimation: true, // Smooth tile loading
          markerZoomAnimation: true, // Animate markers during zoom
          maxBounds: [
            [6.0, 68.0], // Southwest corner (southernmost and westernmost points)
            [37.5, 97.5], // Northeast corner (northernmost and easternmost points)
          ],
          maxBoundsViscosity: 1.0, // Prevents dragging outside bounds completely
          minZoom: 5, // Minimum zoom level to keep India visible
          maxZoom: 18, // Maximum zoom level for detailed view
        }).setView([28.6139, 77.209], 5) // Changed center to Delhi coordinates and reduced zoom from 6 to 5 for more zoomed out view

        L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 20,
        }).addTo(leafletMap)

        leafletMap.getContainer().style.borderRadius = "12px"
        leafletMap.getContainer().style.overflow = "hidden"
        leafletMap.getContainer().style.boxShadow =
          "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"

        const zoomControl = leafletMap.zoomControl
        zoomControl.setPosition("topright")

        // Add custom styling for zoom controls
        setTimeout(() => {
          const zoomControls = leafletMap.getContainer().querySelectorAll(".leaflet-control-zoom a")
          zoomControls.forEach((control: any) => {
            control.style.background = "rgba(255, 255, 255, 0.95)"
            control.style.backdropFilter = "blur(10px)"
            control.style.border = "1px solid rgba(0, 0, 0, 0.1)"
            control.style.borderRadius = "8px"
            control.style.margin = "2px"
            control.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)"
            control.style.transition = "all 0.2s ease"
          })
        }, 100)

        setMap(leafletMap)
      })
    }

    return () => {
      if (map) {
        map.remove()
        setMap(null)
      }
    }
  }, [mapContainer])

  useEffect(() => {
    if (map) {
      // Clear existing markers
      map.eachLayer((layer: any) => {
        if (layer instanceof (window as any).L?.Marker) {
          map.removeLayer(layer)
        }
      })

      const assetsWithCoordinates = assets.filter((asset) => asset.coordinates)

      assetsWithCoordinates.forEach((asset) => {
        if (asset.coordinates) {
          const location = locations.find((loc) => loc.id === asset.locationId)
          const category = categories.find((cat) => cat.id === asset.categoryId)

          const iconColor = getAssetStatusColor(asset)
          const iconSymbol = getAssetIcon(category?.name || "")
          const status = getAssetStatus(asset)

          import("leaflet").then((L) => {
            const customIcon = L.divIcon({
              html: `
                <div style="
                  background: linear-gradient(135deg, ${iconColor} 0%, ${adjustBrightness(iconColor, -20)} 100%);
                  width: 40px; 
                  height: 40px; 
                  border-radius: 50%; 
                  display: flex; 
                  align-items: center; 
                  justify-content: center; 
                  border: 3px solid white; 
                  box-shadow: 0 4px 12px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1);
                  position: relative;
                  transition: all 0.2s ease;
                  cursor: pointer;
                ">
                  <span style="color: white; font-size: 18px; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">${iconSymbol}</span>
                  <div style="
                    position: absolute;
                    top: -2px;
                    right: -2px;
                    width: 12px;
                    height: 12px;
                    background: ${getStatusDotColor(status)};
                    border: 2px solid white;
                    border-radius: 50%;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                  "></div>
                </div>
              `,
              className: "custom-marker-enhanced",
              iconSize: [40, 40],
              iconAnchor: [20, 20],
            })

            const marker = L.marker([asset.coordinates.latitude, asset.coordinates.longitude], { icon: customIcon })
              .addTo(map)
              .bindPopup(
                `
                <div style="
                  min-width: 280px; 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  background: white;
                  border-radius: 12px;
                  overflow: hidden;
                  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                ">
                  <div style="
                    background: linear-gradient(135deg, ${iconColor} 0%, ${adjustBrightness(iconColor, -20)} 100%);
                    color: white;
                    padding: 16px;
                    text-align: center;
                  ">
                    <div style="font-size: 24px; margin-bottom: 4px;">${iconSymbol}</div>
                    <h3 style="margin: 0; font-weight: 600; font-size: 16px;">${asset.name || "Unknown Asset"}</h3>
                    <div style="
                      display: inline-block;
                      background: rgba(255,255,255,0.2);
                      padding: 4px 12px;
                      border-radius: 20px;
                      font-size: 12px;
                      margin-top: 8px;
                      font-weight: 500;
                    ">${status}</div>
                  </div>
                  <div style="padding: 16px;">
                    <div style="display: grid; gap: 12px;">
                      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                        <span style="color: #666; font-size: 13px; font-weight: 500;">Serial Number</span>
                        <span style="color: #333; font-size: 13px; font-weight: 600;">${asset.serialNumber || "N/A"}</span>
                      </div>
                      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                        <span style="color: #666; font-size: 13px; font-weight: 500;">Location</span>
                        <span style="color: #333; font-size: 13px; font-weight: 600;">${location?.name || "Unknown"}</span>
                      </div>
                      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                        <span style="color: #666; font-size: 13px; font-weight: 500;">IP Address</span>
                        <span style="color: #333; font-size: 13px; font-weight: 600; font-family: monospace;">${asset.ipAddress || "Not set"}</span>
                      </div>
                      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
                        <span style="color: #666; font-size: 13px; font-weight: 500;">Operating Hours</span>
                        <span style="color: #333; font-size: 13px; font-weight: 600;">${asset.operatingHours || "Not set"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              `,
                {
                  maxWidth: 300,
                  className: "custom-popup",
                },
              )
          })
        }
      })
    }
  }, [map, assets, locations, categories])

  const adjustBrightness = (color: string, percent: number) => {
    const num = Number.parseInt(color.replace("#", ""), 16)
    const amt = Math.round(2.55 * percent)
    const R = (num >> 16) + amt
    const G = ((num >> 8) & 0x00ff) + amt
    const B = (num & 0x0000ff) + amt
    return (
      "#" +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
    )
  }

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case "Active":
        return "#22c55e"
      case "Maintenance Required":
        return "#f59e0b"
      case "Expired Warranty":
        return "#ef4444"
      default:
        return "#22c55e"
    }
  }

  const getAssetStatus = (asset: any) => {
    const currentDate = new Date()

    if (asset.warrantyStartDate && asset.warrantyPeriodMonths) {
      const warrantyEnd = new Date(asset.warrantyStartDate)
      warrantyEnd.setMonth(warrantyEnd.getMonth() + asset.warrantyPeriodMonths)

      if (warrantyEnd < currentDate) {
        return "Expired Warranty"
      }
    }

    if (asset.nextMaintenanceDate) {
      const nextMaintenance = new Date(asset.nextMaintenanceDate)
      if (nextMaintenance < currentDate) {
        return "Maintenance Required"
      }
    }

    return "Active"
  }

  const getAssetStatusColor = (asset: any) => {
    const status = getAssetStatus(asset)
    switch (status) {
      case "Active":
        return "#10b981" // green
      case "Maintenance Required":
        return "#f59e0b" // amber
      case "Expired Warranty":
        return "#ef4444" // red
      default:
        return "#10b981"
    }
  }

  const getAssetIcon = (categoryName: string) => {
    if (categoryName.toLowerCase().includes("display") || categoryName.toLowerCase().includes("screen")) {
      return "📺"
    }
    if (categoryName.toLowerCase().includes("player") || categoryName.toLowerCase().includes("media")) {
      return "📱"
    }
    if (categoryName.toLowerCase().includes("accessory")) {
      return "🔧"
    }
    return "📺"
  }

  useEffect(() => {
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
    document.head.appendChild(link)

    const style = document.createElement("style")
    style.textContent = `
      .custom-popup .leaflet-popup-content-wrapper {
        padding: 0;
        border-radius: 12px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      }
      .custom-popup .leaflet-popup-tip {
        background: white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .custom-marker-enhanced:hover {
        transform: scale(1.1);
      }
      .leaflet-container {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(link)
      document.head.removeChild(style)
    }
  }, [])

  return (
    <div className="space-y-4">
      <div ref={setMapContainer} className="w-full h-96 rounded-xl border-0 shadow-lg" style={{ minHeight: "400px" }} />

      <div className="bg-background/95 backdrop-blur-sm p-4 rounded-xl border shadow-sm">
        <h4 className="font-semibold text-sm mb-3 text-foreground">Map Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500 shadow-sm border border-green-600"></div>
            <span className="text-muted-foreground font-medium">Active Assets</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-amber-500 shadow-sm border border-amber-600"></div>
            <span className="text-muted-foreground font-medium">Maintenance Required</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500 shadow-sm border border-red-600"></div>
            <span className="text-muted-foreground font-medium">Expired Warranty</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">📺</span>
            <span className="text-muted-foreground font-medium">Digital Displays</span>
          </div>
        </div>
      </div>
    </div>
  )
}
