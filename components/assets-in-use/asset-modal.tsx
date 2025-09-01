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
import type { Asset, MasterAsset, Location, Section, SubSection, Zone } from "@/lib/types"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface AssetModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (asset: Asset) => void
  masterAssets: MasterAsset[]
  locations: Location[]
  sections: Section[]
  subSections: SubSection[]
  zones: Zone[]
  asset: Asset | null
}

const formSchema = z.object({
  masterAssetId: z.string().min(1, "This field is required"),
  locationId: z.string().min(1, "This field is required"),
  sectionId: z.string().min(1, "This field is required"),
  subSectionId: z.string().min(1, "This field is required"),
  zoneId: z.string().min(1, "This field is required"),
  serialNumber: z.string().min(1, "This field is required"),
  barcode: z.string().optional(),
  purchaseDate: z.date({
    required_error: "Purchase date is required",
  }),
  installationDate: z.date({
    required_error: "Installation date is required",
  }),
  warrantyStartDate: z.date({
    required_error: "Warranty start date is required",
  }),
  warrantyEndDate: z.date({
    required_error: "Warranty end date is required",
  }),
  description: z.string().optional(),
  timeSpentMinutes: z.coerce
    .number()
    .min(0, "Time spent must be a positive number")
    .or(z.literal("").transform(() => 0)),
  // Digital signage operational fields
  ipAddress: z.string().optional(),
  macAddress: z.string().optional(),
  contentManagementSystem: z.string().optional(),
  displayOrientation: z.enum(["Landscape", "Portrait"]).optional(),
  brightnessLevel: z.coerce.number().min(0).max(100).optional(),
  operatingHours: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
})

export default function AssetModal({
  isOpen,
  onClose,
  onSave,
  masterAssets,
  locations,
  sections,
  subSections,
  zones,
  asset,
}: AssetModalProps) {
  const [filteredSections, setFilteredSections] = useState<Section[]>([])
  const [filteredSubSections, setFilteredSubSections] = useState<SubSection[]>([])
  const [filteredZones, setFilteredZones] = useState<Zone[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: asset
      ? {
          masterAssetId: asset.masterAssetId,
          locationId: asset.locationId,
          sectionId: asset.sectionId,
          subSectionId: asset.subSectionId,
          zoneId: asset.zoneId,
          serialNumber: asset.serialNumber,
          barcode: asset.barcode || "",
          purchaseDate: new Date(asset.purchaseDate),
          installationDate: new Date(asset.installationDate),
          warrantyStartDate: new Date(asset.warrantyStartDate),
          warrantyEndDate: new Date(asset.warrantyEndDate),
          description: asset.description || "",
          timeSpentMinutes: asset.timeSpentMinutes || 0,
          ipAddress: asset.ipAddress || "",
          macAddress: asset.macAddress || "",
          contentManagementSystem: asset.contentManagementSystem || "",
          displayOrientation: asset.displayOrientation || "Landscape",
          brightnessLevel: asset.brightnessLevel || 75,
          operatingHours: asset.operatingHours || "",
          latitude: asset.coordinates?.latitude || 0,
          longitude: asset.coordinates?.longitude || 0,
        }
      : {
          masterAssetId: "",
          locationId: "",
          sectionId: "",
          subSectionId: "",
          zoneId: "",
          serialNumber: "",
          barcode: "",
          purchaseDate: new Date(),
          installationDate: new Date(),
          warrantyStartDate: new Date(),
          warrantyEndDate: new Date(),
          description: "",
          timeSpentMinutes: 0,
          ipAddress: "",
          macAddress: "",
          contentManagementSystem: "",
          displayOrientation: "Landscape",
          brightnessLevel: 75,
          operatingHours: "",
          latitude: 0,
          longitude: 0,
        },
  })

  useEffect(() => {
    if (asset) {
      form.reset({
        masterAssetId: asset.masterAssetId,
        locationId: asset.locationId,
        sectionId: asset.sectionId,
        subSectionId: asset.subSectionId,
        zoneId: asset.zoneId,
        serialNumber: asset.serialNumber,
        barcode: asset.barcode || "",
        purchaseDate: new Date(asset.purchaseDate),
        installationDate: new Date(asset.installationDate),
        warrantyStartDate: new Date(asset.warrantyStartDate),
        warrantyEndDate: new Date(asset.warrantyEndDate),
        description: asset.description || "",
        timeSpentMinutes: asset.timeSpentMinutes || 0,
        ipAddress: asset.ipAddress || "",
        macAddress: asset.macAddress || "",
        contentManagementSystem: asset.contentManagementSystem || "",
        displayOrientation: asset.displayOrientation || "Landscape",
        brightnessLevel: asset.brightnessLevel || 75,
        operatingHours: asset.operatingHours || "",
        latitude: asset.coordinates?.latitude || 0,
        longitude: asset.coordinates?.longitude || 0,
      })

      // Update filtered lists
      updateFilteredSections(asset.locationId)
      updateFilteredSubSections(asset.sectionId)
      updateFilteredZones(asset.subSectionId)
    }
  }, [asset, form])

  // Watch for changes to cascade dropdowns
  const locationId = form.watch("locationId")
  const sectionId = form.watch("sectionId")
  const subSectionId = form.watch("subSectionId")

  // Update filtered sections when location changes
  useEffect(() => {
    if (locationId) {
      updateFilteredSections(locationId)
      form.setValue("sectionId", "")
      form.setValue("subSectionId", "")
      form.setValue("zoneId", "")
    }
  }, [locationId, form])

  // Update filtered subsections when section changes
  useEffect(() => {
    if (sectionId) {
      updateFilteredSubSections(sectionId)
      form.setValue("subSectionId", "")
      form.setValue("zoneId", "")
    }
  }, [sectionId, form])

  // Update filtered zones when subsection changes
  useEffect(() => {
    if (subSectionId) {
      updateFilteredZones(subSectionId)
      form.setValue("zoneId", "")
    }
  }, [subSectionId, form])

  const updateFilteredSections = (locationId: string) => {
    setFilteredSections(sections.filter((section) => section.locationId === locationId))
  }

  const updateFilteredSubSections = (sectionId: string) => {
    setFilteredSubSections(subSections.filter((subSection) => subSection.sectionId === sectionId))
  }

  const updateFilteredZones = (subSectionId: string) => {
    setFilteredZones(zones.filter((zone) => zone.subSectionId === subSectionId))
  }

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSave({
      id: asset?.id || "0", // Temporary ID, will be replaced in the parent component
      masterAssetId: values.masterAssetId,
      locationId: values.locationId,
      sectionId: values.sectionId,
      subSectionId: values.subSectionId,
      zoneId: values.zoneId,
      serialNumber: values.serialNumber,
      barcode: values.barcode,
      purchaseDate: format(values.purchaseDate, "yyyy-MM-dd"),
      installationDate: format(values.installationDate, "yyyy-MM-dd"),
      warrantyStartDate: format(values.warrantyStartDate, "yyyy-MM-dd"),
      warrantyEndDate: format(values.warrantyEndDate, "yyyy-MM-dd"),
      description: values.description || "",
      timeSpentMinutes: values.timeSpentMinutes,
      lastMaintenanceDate: asset?.lastMaintenanceDate || null,
      maintenanceScheduleId: asset?.maintenanceScheduleId || null,
      nextMaintenanceDate: asset?.nextMaintenanceDate || null,
      ipAddress: values.ipAddress,
      macAddress: values.macAddress,
      contentManagementSystem: values.contentManagementSystem,
      displayOrientation: values.displayOrientation,
      brightnessLevel: values.brightnessLevel,
      operatingHours: values.operatingHours,
      coordinates:
        values.latitude && values.longitude
          ? {
              latitude: values.latitude,
              longitude: values.longitude,
            }
          : undefined,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{asset ? "Edit Asset" : "Add Asset"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="masterAssetId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Master Asset*</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a master asset" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {masterAssets.map((masterAsset) => (
                        <SelectItem key={masterAsset.id} value={masterAsset.id}>
                          {masterAsset.name}
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
                name="locationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location*</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sectionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section*</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!locationId}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a section" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredSections.map((section) => (
                          <SelectItem key={section.id} value={section.id}>
                            {section.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subSectionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sub-section*</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!sectionId}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a sub-section" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredSubSections.map((subSection) => (
                          <SelectItem key={subSection.id} value={subSection.id}>
                            {subSection.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="zoneId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zone*</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!subSectionId}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a zone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredZones.map((zone) => (
                          <SelectItem key={zone.id} value={zone.id}>
                            {zone.name}
                          </SelectItem>
                        ))}
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
                name="serialNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serial Number*</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter serial number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Barcode</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter barcode (optional)" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
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
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
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
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
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
                name="warrantyEndDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Warranty End Date*</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
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
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Digital Signage Configuration</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ipAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IP Address</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., 192.168.1.100" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="macAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>MAC Address</FormLabel>
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
                      <FormLabel>Content Management System</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Samsung MagicInfo" />
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
                      <FormLabel>Display Orientation</FormLabel>
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
                  name="brightnessLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brightness Level (%)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="0" max="100" placeholder="0-100" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="operatingHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Operating Hours</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., 24/7 or 9AM-6PM" />
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
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Enter description (optional)" value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timeSpentMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time Spent (minutes)</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" min="0" placeholder="Enter time spent in minutes" />
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
