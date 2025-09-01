"use client"
import { useState } from "react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import AssetsInUse from "@/components/assets-in-use/assets-in-use"
import { UnifiedAssetModal } from "@/components/assets-in-use/unified-asset-modal"
import { useAssetContext } from "@/lib/asset-context"

export default function AssetManagement() {
  const [showAddAsset, setShowAddAsset] = useState(false)
  const { assets, setAssets, locations, sections, subSections, zones, categories } = useAssetContext()

  console.log("[v0] Asset Management - Categories available:", categories?.length || 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assets under management</h1>
        </div>
      </div>

      <Tabs defaultValue="assets" className="w-full">
        <TabsContent value="assets">
          <AssetsInUse
            assets={assets}
            setAssets={setAssets}
            locations={locations}
            sections={sections}
            subSections={subSections}
            zones={zones}
            categories={categories}
          />
        </TabsContent>
      </Tabs>

      <UnifiedAssetModal
        isOpen={showAddAsset}
        onClose={() => setShowAddAsset(false)}
        locations={locations}
        sections={sections}
        subSections={subSections}
        zones={zones}
      />
    </div>
  )
}
