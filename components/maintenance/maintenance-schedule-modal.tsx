"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { cn } from "@/lib/utils"
import type { Asset, MaintenanceSchedule } from "@/lib/types"
import { useAssetContext } from "@/lib/asset-context"

interface MaintenanceScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  asset: Asset
  maintenanceSchedules: MaintenanceSchedule[]
  onSave: (asset: Asset, scheduleId: string, lastMaintenanceDate: string) => void
}

const formSchema = z.object({
  scheduleId: z.string().min(1, "Please select a maintenance schedule"),
  lastMaintenanceDate: z.date({
    required_error: "Please select the last maintenance date",
  }),
})

export default function MaintenanceScheduleModal({
  isOpen,
  onClose,
  asset,
  maintenanceSchedules,
  onSave,
}: MaintenanceScheduleModalProps) {
  const { masterAssets } = useAssetContext()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      scheduleId: asset.maintenanceScheduleId || "",
      lastMaintenanceDate: asset.lastMaintenanceDate ? new Date(asset.lastMaintenanceDate) : new Date(),
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSave(asset, values.scheduleId, format(values.lastMaintenanceDate, "yyyy-MM-dd"))
  }

  // Get asset name
  const getAssetName = () => {
    const masterAsset = masterAssets.find((ma) => ma.id === asset.masterAssetId)
    return masterAsset ? masterAsset.name : "Unknown Asset"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule Maintenance for {getAssetName()}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="scheduleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maintenance Schedule</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a maintenance schedule" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {maintenanceSchedules.map((schedule) => (
                        <SelectItem key={schedule.id} value={schedule.id}>
                          {schedule.name} - {schedule.serviceType} ({schedule.intervalValue} {schedule.intervalUnit}
                          {schedule.intervalValue > 1 ? "s" : ""})
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
              name="lastMaintenanceDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Last Maintenance Date</FormLabel>
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
