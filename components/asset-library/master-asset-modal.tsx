"use client"

import { useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import type { AssetCategory, MasterAsset } from "@/lib/types"

interface MasterAssetModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (asset: MasterAsset) => void
  categories: AssetCategory[]
  asset: MasterAsset | null
}

const formSchema = z.object({
  name: z.string().min(1, "This field is required"),
  categoryId: z.string().min(1, "This field is required"),
  manufacturer: z.string().optional(),
  modelNumber: z.string().optional(),
  description: z.string().optional(),
  estimatedMaintenanceTime: z.coerce
    .number()
    .min(0, "Maintenance time must be a positive number")
    .or(z.literal("").transform(() => 0)),
  screenSize: z.string().optional(),
  resolution: z.string().optional(),
  connectivity: z.array(z.string()).optional(),
  powerConsumption: z.coerce.number().optional(),
  operatingSystem: z.string().optional(),
  mountType: z.string().optional(),
})

export default function MasterAssetModal({ isOpen, onClose, onSave, categories, asset }: MasterAssetModalProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: asset?.name || "",
      categoryId: asset?.categoryId || "",
      manufacturer: asset?.manufacturer || "",
      modelNumber: asset?.modelNumber || "",
      description: asset?.description || "",
      estimatedMaintenanceTime: asset?.estimatedMaintenanceTime || 0,
      screenSize: asset?.screenSize || "",
      resolution: asset?.resolution || "",
      connectivity: asset?.connectivity || [],
      powerConsumption: asset?.powerConsumption || 0,
      operatingSystem: asset?.operatingSystem || "",
      mountType: asset?.mountType || "",
    },
  })

  // Update form when asset changes
  useEffect(() => {
    if (asset) {
      form.reset({
        name: asset.name,
        categoryId: asset.categoryId,
        manufacturer: asset.manufacturer,
        modelNumber: asset.modelNumber,
        description: asset.description,
        estimatedMaintenanceTime: asset.estimatedMaintenanceTime,
        screenSize: asset.screenSize || "",
        resolution: asset.resolution || "",
        connectivity: asset.connectivity || [],
        powerConsumption: asset.powerConsumption || 0,
        operatingSystem: asset.operatingSystem || "",
        mountType: asset.mountType || "",
      })
    } else {
      form.reset({
        name: "",
        categoryId: "",
        manufacturer: "",
        modelNumber: "",
        description: "",
        estimatedMaintenanceTime: 0,
        screenSize: "",
        resolution: "",
        connectivity: [],
        powerConsumption: 0,
        operatingSystem: "",
        mountType: "",
      })
    }
  }, [asset, form])

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSave({
      id: asset?.id || "0", // Temporary ID, will be replaced in the parent component
      name: values.name,
      categoryId: values.categoryId,
      manufacturer: values.manufacturer || "",
      modelNumber: values.modelNumber || "",
      description: values.description || "",
      estimatedMaintenanceTime: values.estimatedMaintenanceTime,
      screenSize: values.screenSize,
      resolution: values.resolution,
      connectivity: values.connectivity,
      powerConsumption: values.powerConsumption,
      operatingSystem: values.operatingSystem,
      mountType: values.mountType,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{asset ? "Edit Master Asset" : "Add Asset Type"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset Name*</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter asset name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category*</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="manufacturer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manufacturer</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter manufacturer" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="modelNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter model number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="screenSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Screen Size</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., 55 inch" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="resolution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resolution</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select resolution" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="4K">4K (3840x2160)</SelectItem>
                        <SelectItem value="1080p">1080p (1920x1080)</SelectItem>
                        <SelectItem value="720p">720p (1280x720)</SelectItem>
                        <SelectItem value="1440p">1440p (2560x1440)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="powerConsumption"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Power Consumption (Watts)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="0" placeholder="Enter power consumption" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="operatingSystem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operating System</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Android, Windows, Tizen" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="mountType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mount Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select mount type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Wall Mount">Wall Mount</SelectItem>
                      <SelectItem value="Floor Stand">Floor Stand</SelectItem>
                      <SelectItem value="Ceiling Mount">Ceiling Mount</SelectItem>
                      <SelectItem value="Desktop">Desktop</SelectItem>
                      <SelectItem value="Kiosk">Kiosk</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Enter description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estimatedMaintenanceTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Maintenance Time (minutes)</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" min="0" placeholder="Enter time in minutes" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
