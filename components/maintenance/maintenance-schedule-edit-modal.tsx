"use client"

import { useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import type { MaintenanceSchedule } from "@/lib/types"

interface MaintenanceScheduleEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (schedule: MaintenanceSchedule) => void
  schedule: MaintenanceSchedule | null
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  serviceType: z.string().min(1, "Service type is required"),
  intervalValue: z.coerce.number().min(1, "Interval must be at least 1"),
  intervalUnit: z.enum(["hour", "day", "week", "month", "year"]),
})

export default function MaintenanceScheduleEditModal({
  isOpen,
  onClose,
  onSave,
  schedule,
}: MaintenanceScheduleEditModalProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: schedule?.name || "",
      serviceType: schedule?.serviceType || "",
      intervalValue: schedule?.intervalValue || 1,
      intervalUnit: schedule?.intervalUnit || "month",
    },
  })

  // Update form when schedule changes
  useEffect(() => {
    if (schedule) {
      form.reset({
        name: schedule.name,
        serviceType: schedule.serviceType,
        intervalValue: schedule.intervalValue,
        intervalUnit: schedule.intervalUnit,
      })
    } else {
      form.reset({
        name: "",
        serviceType: "",
        intervalValue: 1,
        intervalUnit: "month",
      })
    }
  }, [schedule, form])

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSave({
      id: schedule?.id || Date.now().toString(),
      ...values,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{schedule ? "Edit Maintenance Schedule" : "Create Maintenance Schedule"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Schedule Name*</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter schedule name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Type*</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="E.g., Cleaning, Inspection, Calibration" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="intervalValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interval Value*</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="intervalUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interval Unit*</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="hour">Hour</SelectItem>
                        <SelectItem value="day">Day</SelectItem>
                        <SelectItem value="week">Week</SelectItem>
                        <SelectItem value="month">Month</SelectItem>
                        <SelectItem value="year">Year</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
