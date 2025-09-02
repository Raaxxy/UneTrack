"use client"

import { useAssetContext } from "@/lib/asset-context"
import { useState, useEffect, useRef } from "react"
import * as google from "googlemaps"

export default function AssetMap() {
  const { assets } = useAssetContext()
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [markers, setMarkers] = useState<google.maps.Marker[]>([])

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return

      try {
        const { Map } = (await google.maps.importLibrary("maps")) as google.maps.MapsLibrary

        const mapInstance = new Map(mapRef.current, {
          center: { lat: 28.6139, lng: 77.209 }, // Delhi, India
          zoom: 5,
          restriction: {
            latLngBounds: {
              north: 37.6,
              south: 6.4,
              west: 68.1,
              east: 97.4,
            },
          },
          styles: [
            {
              featureType: "all",
              elementType: "geometry.fill",
              stylers: [{ color: "#1a1a1a" }],
            },
            {
              featureType: "all",
              elementType: "labels.text.fill",
              stylers: [{ color: "#ffffff" }],
            },
            {
              featureType: "all",
              elementType: "labels.text.stroke",
              stylers: [{ color: "#000000" }, { lightness: 13 }],
            },
            {
              featureType: "administrative",
              elementType: "geometry.fill",
              stylers: [{ color: "#000000" }],
            },
            {
              featureType: "administrative",
              elementType: "geometry.stroke",
              stylers: [{ color: "#144b53" }, { lightness: 14 }, { weight: 1.4 }],
            },
            {
              featureType: "landscape",
              elementType: "all",
              stylers: [{ color: "#08304b" }],
            },
            {
              featureType: "poi",
              elementType: "geometry",
              stylers: [{ color: "#0c4152" }, { lightness: 5 }],
            },
            {
              featureType: "road.highway",
              elementType: "geometry.fill",
              stylers: [{ color: "#000000" }],
            },
            {
              featureType: "road.highway",
              elementType: "geometry.stroke",
              stylers: [{ color: "#0b434f" }, { lightness: 25 }],
            },
            {
              featureType: "road.arterial",
              elementType: "geometry.fill",
              stylers: [{ color: "#000000" }],
            },
            {
              featureType: "road.arterial",
              elementType: "geometry.stroke",
              stylers: [{ color: "#0b3d51" }, { lightness: 16 }],
            },
            {
              featureType: "road.local",
              elementType: "geometry",
              stylers: [{ color: "#000000" }],
            },
            {
              featureType: "transit",
              elementType: "all",
              stylers: [{ color: "#146474" }],
            },
            {
              featureType: "water",
              elementType: "all",
              stylers: [{ color: "#021019" }],
            },
          ],
        })

        setMap(mapInstance)
        console.log("[v0] Google Maps initialized successfully")
      } catch (error) {
        console.error("[v0] Error initializing Google Maps:", error)
      }
    }

    initMap()
  }, [])

  useEffect(() => {
    if (!map || !assets.length) {
      console.log("[v0] Map or assets not ready:", { hasMap: !!map, assetsLength: assets.length })
      return
    }

    console.log("[v0] Assets available for map:", assets.length)
    assets.forEach((asset, index) => {
      const lat = asset.latitude || (asset as any).lat
      const lng = asset.longitude || (asset as any).lng || (asset as any).lon
      console.log(`[v0] Asset ${index + 1}:`, {
        name: asset.name,
        latitude: lat,
        longitude: lng,
        hasCoordinates: !!(lat && lng),
        latType: typeof lat,
        lngType: typeof lng,
        rawAsset: asset,
      })
    })

    const assetsWithCoordinates = assets.filter((asset) => {
      const lat = asset.latitude || (asset as any).lat
      const lng = asset.longitude || (asset as any).lng || (asset as any).lon
      const hasValidCoords = lat && lng && lat !== "0" && lng !== "0" && lat !== 0 && lng !== 0
      console.log(`[v0] Asset ${asset.name} coordinates check:`, { lat, lng, hasValidCoords })
      return hasValidCoords
    })

    console.log("[v0] Assets with valid coordinates:", assetsWithCoordinates.length)

    // Clear existing markers
    markers.forEach((marker) => marker.setMap(null))
    const newMarkers: google.maps.Marker[] = []

    assetsWithCoordinates.forEach((asset) => {
      const lat = asset.latitude || (asset as any).lat
      const lng = asset.longitude || (asset as any).lng || (asset as any).lon

      if (lat && lng) {
        console.log("[v0] Adding marker for asset:", asset.name, "at", lat, lng)

        try {
          const marker = new google.maps.Marker({
            position: {
              lat: Number.parseFloat(lat.toString()),
              lng: Number.parseFloat(lng.toString()),
            },
            map: map,
            title: asset.name || "Asset",
            icon: {
              url:
                "data:image/svg+xml;base64," +
                btoa(`
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="12" fill="#ea580c" stroke="#fff" strokeWidth="3"/>
                    <circle cx="16" cy="16" r="4" fill="#fff"/>
                  </svg>
                `),
              scaledSize: new google.maps.Size(32, 32),
              anchor: new google.maps.Point(16, 16),
            },
          })

          const serialNumber = asset.serialNumber || (asset as any).serial_number || "N/A"
          const assetLocation = asset.assetLocation || (asset as any).asset_location || "Unknown"
          const modelNumber = asset.modelNumber || (asset as any).model_number || "N/A"

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 12px; min-width: 250px; font-family: system-ui;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #1a1a1a;">${asset.name || "Asset"}</h3>
                <p style="margin: 4px 0; font-size: 13px; color: #666;"><strong>Serial:</strong> ${serialNumber}</p>
                <p style="margin: 4px 0; font-size: 13px; color: #666;"><strong>Location:</strong> ${assetLocation}</p>
                <p style="margin: 4px 0; font-size: 13px; color: #666;"><strong>Manufacturer:</strong> ${asset.manufacturer || "N/A"}</p>
                <p style="margin: 4px 0; font-size: 13px; color: #666;"><strong>Model:</strong> ${modelNumber}</p>
                <p style="margin: 4px 0; font-size: 13px; color: #666;"><strong>Coordinates:</strong> ${lat}, ${lng}</p>
              </div>
            `,
          })

          marker.addListener("click", () => {
            infoWindow.open(map, marker)
          })

          newMarkers.push(marker)
          console.log("[v0] Successfully added marker for:", asset.name)
        } catch (error) {
          console.error("[v0] Error creating marker for asset:", asset.name, error)
        }
      }
    })

    setMarkers(newMarkers)
    console.log(`[v0] Added ${newMarkers.length} asset markers to map`)
  }, [map, assets])

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden border border-border">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  )
}
