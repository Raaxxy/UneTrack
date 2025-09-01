"use client"

import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useAssetContext } from "@/lib/asset-context"
import AssetModal from "@/components/assets-in-use/asset-modal"

export default function EditAssetPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const { assets, masterAssets, locations, sections, subSections, zones, updateAsset } = useAssetContext()
  const [asset, setAsset] = useState(assets.find((a) => a.id === id) || null)
  const [isModalOpen, setIsModalOpen] = useState(true)

  useEffect(() => {
    if (!asset) {
      router.push("/")
    }
  }, [asset, router])

  const handleSave = (updatedAsset: any) => {
    updateAsset(updatedAsset)
    router.push(`/assets/${id}`)
  }

  const handleClose = () => {
    router.push(`/assets/${id}`)
  }

  if (!asset) return null

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-8">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Edit Asset</h1>
      </div>

      <AssetModal
        isOpen={isModalOpen}
        onClose={handleClose}
        onSave={handleSave}
        masterAssets={masterAssets}
        locations={locations}
        sections={sections}
        subSections={subSections}
        zones={zones}
        asset={asset}
      />
    </div>
  )
}
