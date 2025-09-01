"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PlusCircle, Pencil, Trash2, Search, X, MoreHorizontal, Copy } from "lucide-react"
import type { AssetCategory, Asset } from "@/lib/types"
import CategoryModal from "./category-modal"
import DeleteConfirmationModal from "../shared/delete-confirmation-modal"
import { toast } from "@/components/ui/use-toast"

interface AssetCategoriesProps {
  categories: AssetCategory[]
  setCategories: React.Dispatch<React.SetStateAction<AssetCategory[]>>
  assets: Asset[]
}

export default function AssetCategories({ categories, setCategories, assets }: AssetCategoriesProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<AssetCategory | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories

    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [categories, searchQuery])

  const handleAddCategory = () => {
    setCurrentCategory(null)
    setIsModalOpen(true)
  }

  const handleEditCategory = (category: AssetCategory) => {
    setCurrentCategory(category)
    setIsModalOpen(true)
  }

  const handleDeleteCategory = (category: AssetCategory) => {
    setCurrentCategory(category)
    setIsDeleteModalOpen(true)
  }

  const handleDuplicateCategory = (category: AssetCategory) => {
    const newId = (Math.max(...categories.map((cat) => Number.parseInt(cat.id)), 0) + 1).toString()
    const duplicatedCategory = {
      ...category,
      id: newId,
      name: `${category.name} (Copy)`,
      description: `${category.description || ""} (Copy)`,
    }
    setCategories([...categories, duplicatedCategory])
    toast({
      title: "Category Duplicated",
      description: "Category has been successfully duplicated.",
    })
  }

  const handleBulkDelete = () => {
    if (selectedCategories.length === 0) return

    const categoriesInUse = selectedCategories.filter((categoryId) =>
      assets.some((asset) => asset.categoryId === categoryId),
    )

    if (categoriesInUse.length > 0) {
      toast({
        title: "Cannot Delete Categories",
        description: `${categoriesInUse.length} categories are in use and cannot be deleted.`,
        variant: "destructive",
      })
      return
    }

    setCategories(categories.filter((cat) => !selectedCategories.includes(cat.id)))
    setSelectedCategories([])
    toast({
      title: "Categories Deleted",
      description: `${selectedCategories.length} categories have been successfully deleted.`,
    })
  }

  const confirmDelete = () => {
    if (!currentCategory) return

    const isInUse = assets.some((asset) => asset.categoryId === currentCategory.id)

    if (isInUse) {
      toast({
        title: "Cannot Delete Category",
        description: "This category is in use and cannot be deleted.",
        variant: "destructive",
      })
    } else {
      setCategories(categories.filter((cat) => cat.id !== currentCategory.id))
      toast({
        title: "Category Deleted",
        description: "The category has been successfully deleted.",
      })
    }

    setIsDeleteModalOpen(false)
  }

  const saveCategory = (category: AssetCategory) => {
    if (currentCategory) {
      setCategories(categories.map((cat) => (cat.id === category.id ? category : cat)))
      toast({
        title: "Category Updated",
        description: "The category has been successfully updated.",
      })
    } else {
      const newId = (Math.max(...categories.map((cat) => Number.parseInt(cat.id)), 0) + 1).toString()
      setCategories([...categories, { ...category, id: newId }])
      toast({
        title: "Category Created",
        description: "The new category has been successfully created.",
      })
    }
    setIsModalOpen(false)
  }

  const getUsageCount = (categoryId: string) => {
    const directUsage = assets.filter((asset) => asset.categoryId === categoryId).length
    return { assets: directUsage }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCategories(filteredCategories.map((cat) => cat.id))
    } else {
      setSelectedCategories([])
    }
  }

  const handleSelectCategory = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, categoryId])
    } else {
      setSelectedCategories(selectedCategories.filter((id) => id !== categoryId))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Asset Categories</h2>
          <p className="text-muted-foreground">
            {filteredCategories.length} of {categories.length} categories
            {selectedCategories.length > 0 && ` • ${selectedCategories.length} selected`}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {selectedCategories.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Bulk Actions ({selectedCategories.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Bulk Operations</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleBulkDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button onClick={handleAddCategory}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Category
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedCategories.length === filteredCategories.length && filteredCategories.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Category Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.map((category) => {
              const usage = getUsageCount(category.id)
              return (
                <TableRow key={category.id} className={selectedCategories.includes(category.id) ? "bg-muted/50" : ""}>
                  <TableCell>
                    <Checkbox
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={(checked) => handleSelectCategory(category.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.description || "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {usage.assets > 0 && <Badge variant="secondary">{usage.assets} assets</Badge>}
                      {usage.assets === 0 && <span className="text-muted-foreground text-sm">Unused</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateCategory(category)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteCategory(category)} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
            {filteredCategories.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-muted-foreground">
                      {searchQuery
                        ? "No categories found matching your search."
                        : "No categories found. Create your first category."}
                    </p>
                    {searchQuery && (
                      <Button variant="outline" onClick={() => setSearchQuery("")}>
                        Clear search
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {isModalOpen && (
        <CategoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={saveCategory}
          categories={categories}
          category={currentCategory}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Category"
          description="Are you sure you want to delete this category? This action cannot be undone."
        />
      )}
    </div>
  )
}
