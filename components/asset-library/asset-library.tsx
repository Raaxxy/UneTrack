"use client"

import type React from "react"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Pencil, Trash2, Monitor, Tv, HardDrive } from "lucide-react"
import type { AssetCategory, MasterAsset, Asset } from "@/lib/types"
import MasterAssetModal from "./master-asset-modal"
import DeleteConfirmationModal from "../shared/delete-confirmation-modal"
import { toast } from "@/components/ui/use-toast"

interface AssetLibraryProps {
  masterAssets: MasterAsset[]
  setMasterAssets: React.Dispatch<React.SetStateAction<MasterAsset[]>>
  categories: AssetCategory[]
  assets: Asset[]
}

export default function AssetLibrary({ masterAssets, setMasterAssets, categories, assets }: AssetLibraryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentAsset, setCurrentAsset] = useState<MasterAsset | null>(null)

  const handleAddAsset = () => {
    setCurrentAsset(null)
    setIsModalOpen(true)
  }

  const handleEditAsset = (asset: MasterAsset) => {
    setCurrentAsset(asset)
    setIsModalOpen(true)
  }

  const handleDeleteAsset = (asset: MasterAsset) => {
    setCurrentAsset(asset)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = () => {
    if (!currentAsset) return

    // Check if master asset is in use
    const isInUse = assets.some((asset) => asset.masterAssetId === currentAsset.id)

    if (isInUse) {
      toast({
        title: "Cannot Delete Asset",
        description: "This master asset is in use and cannot be deleted.",
        variant: "destructive",
      })
    } else {
      setMasterAssets(masterAssets.filter((asset) => asset.id !== currentAsset.id))
      toast({
        title: "Asset Deleted",
        description: "The master asset has been successfully deleted.",
      })
    }

    setIsDeleteModalOpen(false)
  }

  const saveAsset = (asset: MasterAsset) => {
    if (currentAsset) {
      // Edit existing asset
      setMasterAssets(masterAssets.map((a) => (a.id === asset.id ? asset : a)))
      toast({
        title: "Asset Updated",
        description: "The master asset has been successfully updated.",
      })
    } else {
      // Add new asset
      const newId = (Math.max(...masterAssets.map((a) => Number.parseInt(a.id)), 0) + 1).toString()
      setMasterAssets([...masterAssets, { ...asset, id: newId }])
      toast({
        title: "Asset Created",
        description: "The new master asset has been successfully created.",
      })
    }
    setIsModalOpen(false)
  }

  // Function to get category name by ID
  const getCategoryName = (id: string) => {
    const category = categories.find((cat) => cat.id === id)
    return category ? category.name : "Unknown"
  }

  const getAssetTypeIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase()
    if (name.includes("display") || name.includes("screen") || name.includes("led") || name.includes("lcd")) {
      return <Monitor className="h-4 w-4 text-blue-600" />
    }
    if (name.includes("player") || name.includes("media")) {
      return <HardDrive className="h-4 w-4 text-green-600" />
    }
    if (name.includes("accessory")) {
      return <Tv className="h-4 w-4 text-orange-600" />
    }
    return <Monitor className="h-4 w-4 text-gray-600" />
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Digital Signage Asset Library</h2>
          <p className="text-muted-foreground">Manage master asset types for digital signage equipment</p>
        </div>
        <Button onClick={handleAddAsset}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Asset Type
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Asset Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Manufacturer</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Screen Size</TableHead>
              <TableHead>Resolution</TableHead>
              <TableHead>Power (W)</TableHead>
              <TableHead>Maintenance (min)</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {masterAssets.map((asset) => {
              const categoryName = getCategoryName(asset.categoryId)
              return (
                <TableRow key={asset.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">{getAssetTypeIcon(categoryName)}</div>
                  </TableCell>
                  <TableCell className="font-medium">{asset.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{categoryName}</Badge>
                  </TableCell>
                  <TableCell>{asset.manufacturer || "—"}</TableCell>
                  <TableCell className="font-mono text-sm">{asset.modelNumber || "—"}</TableCell>
                  <TableCell>{asset.screenSize || "—"}</TableCell>
                  <TableCell>
                    {asset.resolution ? <Badge variant="secondary">{asset.resolution}</Badge> : "—"}
                  </TableCell>
                  <TableCell>{asset.powerConsumption ? `${asset.powerConsumption}W` : "—"}</TableCell>
                  <TableCell>{asset.estimatedMaintenanceTime} min</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="icon" onClick={() => handleEditAsset(asset)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleDeleteAsset(asset)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
            {masterAssets.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Monitor className="h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">No digital signage asset types found.</p>
                    <p className="text-sm text-muted-foreground">Add your first asset type to get started.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {isModalOpen && (
        <MasterAssetModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={saveAsset}
          categories={categories}
          asset={currentAsset}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Master Asset"
          description="Are you sure you want to delete this master asset?"
        />
      )}
    </div>
  )
}
