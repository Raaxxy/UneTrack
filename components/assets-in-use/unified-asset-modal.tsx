"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import type { Asset, AssetCategory } from "@/lib/types"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface UnifiedAssetModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (asset: Asset) => void
  categories: AssetCategory[]
  asset: Asset | null
}

const formSchema = z.object({
  name: z.string().min(1, "Asset name is required"),
  categoryId: z.string().min(1, "Category is required"),
  assetLocation: z.string().optional(),
  googleLocation: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  manufacturer: z.string().min(1, "Manufacturer is required"),
  modelNumber: z.string().min(1, "Model number is required"),
  screenSize: z.string().min(1, "Screen size is required"),
  customScreenSize: z.coerce.number().optional(),
  resolution: z.string().min(1, "Resolution is required"),
  customResolution: z.string().optional(),
  powerConsumption: z.coerce.number().min(0, "Power consumption must be positive"),
  operatingSystem: z.string().min(1, "Operating system is required"),
  description: z.string().optional(),
  purchaseDate: z.date({ required_error: "Purchase date is required" }),
  installationDate: z.date({ required_error: "Installation date is required" }),
  warrantyStartDate: z.date({ required_error: "Warranty start date is required" }),
  warrantyPeriodMonths: z.coerce.number().min(1, "Warranty period is required"),
  macAddress: z.string().min(1, "MAC address is required"),
  contentManagementSystem: z.string().min(1, "CMS name is required"),
  displayOrientation: z.enum(["Landscape", "Portrait"]),
  operatingHours: z.coerce.number().min(1).max(24, "Operating hours must be between 1-24"),
})

const screenSizes = ["32 inch", "43 inch", "50 inch", "55 inch", "65 inch", "75 inch", "85 inch", "Custom"]

const resolutions = ["4K (3840x2160)", "1080p (1920x1080)", "720p (1280x720)", "1440p (2560x1440)", "Custom"]

const operatingSystems = ["Android", "Windows", "Linux", "Tizen", "webOS", "Chrome OS"]

const UnifiedAssetModal = ({ isOpen, onClose, onSave, categories, asset }: UnifiedAssetModalProps) => {
  const [showCustomScreenSize, setShowCustomScreenSize] = useState(false)
  const [showCustomResolution, setShowCustomResolution] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: asset
      ? {
          name: asset.name,
          categoryId: asset.categoryId,
          assetLocation: asset.assetLocation || "",
          googleLocation: asset.googleLocation || "",
          latitude: asset.latitude || 0,
          longitude: asset.longitude || 0,
          manufacturer: asset.manufacturer,
          modelNumber: asset.modelNumber,
          screenSize: asset.screenSize,
          customScreenSize: asset.customScreenSize || 0,
          resolution: asset.resolution,
          customResolution: asset.customResolution || "",
          powerConsumption: asset.powerConsumption,
          operatingSystem: asset.operatingSystem,
          description: asset.description || "",
          purchaseDate: new Date(asset.purchaseDate),
          installationDate: new Date(asset.installationDate),
          warrantyStartDate: new Date(asset.warrantyStartDate),
          warrantyPeriodMonths: asset.warrantyPeriodMonths,
          macAddress: asset.macAddress,
          contentManagementSystem: asset.contentManagementSystem,
          displayOrientation: asset.displayOrientation,
          operatingHours: asset.operatingHours,
        }
      : {
          name: "",
          categoryId: "",
          assetLocation: "",
          googleLocation: "",
          latitude: 0,
          longitude: 0,
          manufacturer: "",
          modelNumber: "",
          screenSize: "",
          customScreenSize: 0,
          resolution: "",
          customResolution: "",
          powerConsumption: 0,
          operatingSystem: "",
          description: "",
          purchaseDate: new Date(),
          installationDate: new Date(),
          warrantyStartDate: new Date(),
          warrantyPeriodMonths: 12,
          macAddress: "",
          contentManagementSystem: "",
          displayOrientation: "Landscape",
          operatingHours: 24,
        },
  })

  const screenSizeValue = form.watch("screenSize")
  const resolutionValue = form.watch("resolution")

  useEffect(() => {
    setShowCustomScreenSize(screenSizeValue === "Custom")
  }, [screenSizeValue])

  useEffect(() => {
    setShowCustomResolution(resolutionValue === "Custom")
  }, [resolutionValue])

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSave({
      id: asset?.id || "0",
      name: values.name,
      categoryId: values.categoryId,
      assetLocation: values.assetLocation || "",
      googleLocation: values.googleLocation,
      latitude: values.latitude,
      longitude: values.longitude,
      manufacturer: values.manufacturer,
      modelNumber: values.modelNumber,
      screenSize: values.screenSize === "Custom" ? `${values.customScreenSize} inch` : values.screenSize,
      customScreenSize: values.customScreenSize,
      resolution: values.resolution === "Custom" ? values.customResolution || "" : values.resolution,
      customResolution: values.customResolution,
      powerConsumption: values.powerConsumption,
      operatingSystem: values.operatingSystem,
      description: values.description || "",
      purchaseDate: format(values.purchaseDate, "yyyy-MM-dd"),
      installationDate: format(values.installationDate, "yyyy-MM-dd"),
      warrantyStartDate: format(values.warrantyStartDate, "yyyy-MM-dd"),
      warrantyPeriodMonths: values.warrantyPeriodMonths,
      macAddress: values.macAddress,
      contentManagementSystem: values.contentManagementSystem,
      displayOrientation: values.displayOrientation,
      operatingHours: values.operatingHours,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{asset ? "Edit Asset" : "Add Asset"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>

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
                  name="assetLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asset Location</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter location name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="googleLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Google Location</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Search location (e.g., Central Park)" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="any" placeholder="e.g., 28.6139" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="any" placeholder="e.g., 77.2090" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="manufacturer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manufacturer*</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter manufacturer name" />
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
                      <FormLabel>Model Number*</FormLabel>
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
                      <FormLabel>Screen Size*</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select screen size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {screenSizes.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {showCustomScreenSize && (
                  <FormField
                    control={form.control}
                    name="customScreenSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Screen Size (inches)*</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="1" placeholder="Enter size in inches" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="resolution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resolution*</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select resolution" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {resolutions.map((res) => (
                            <SelectItem key={res} value={res}>
                              {res}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {showCustomResolution && (
                  <FormField
                    control={form.control}
                    name="customResolution"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Resolution*</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., 1920x1080" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="powerConsumption"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Power Consumption (Watts)*</FormLabel>
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
                      <FormLabel>Operating System*</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select operating system" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {operatingSystems.map((os) => (
                            <SelectItem key={os} value={os}>
                              {os}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Enter asset description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Warranty Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Warranty Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="purchaseDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Purchase Date*</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="installationDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Installation Date*</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="warrantyStartDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Warranty Start Date*</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="warrantyPeriodMonths"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warranty Period (months)*</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="1" placeholder="Enter warranty period in months" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Digital Signage Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Digital Signage Configuration</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="macAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>MAC Address*</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., AA:BB:CC:DD:EE:FF" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contentManagementSystem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content Management System*</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter CMS name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="displayOrientation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Orientation*</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select orientation" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Landscape">Landscape</SelectItem>
                          <SelectItem value="Portrait">Portrait</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="operatingHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Operating Hours (1-24)*</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="1" max="24" placeholder="Enter hours (1-24)" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save Asset</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export { UnifiedAssetModal }
export default UnifiedAssetModal
