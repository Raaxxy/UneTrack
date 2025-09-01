"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { PlusCircle, Pencil, Trash2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useAssetContext } from "@/lib/asset-context"
import type { MaintenanceSchedule } from "@/lib/types"
import MaintenanceScheduleEditModal from "./maintenance-schedule-edit-modal"
import DeleteConfirmationModal from "../shared/delete-confirmation-modal"

export default function MaintenanceScheduleManagement() {
  const { maintenanceSchedules, addMaintenanceSchedule, updateMaintenanceSchedule, deleteMaintenanceSchedule } =
    useAssetContext()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentSchedule, setCurrentSchedule] = useState<MaintenanceSchedule | null>(null)

  const handleAddSchedule = () => {
    setCurrentSchedule(null)
    setIsModalOpen(true)
  }

  const handleEditSchedule = (schedule: MaintenanceSchedule) => {
    setCurrentSchedule(schedule)
    setIsModalOpen(true)
  }

  const handleDeleteSchedule = (schedule: MaintenanceSchedule) => {
    setCurrentSchedule(schedule)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = () => {
    if (!currentSchedule) return

    deleteMaintenanceSchedule(currentSchedule.id)
    toast({
      title: "Schedule Deleted",
      description: "The maintenance schedule has been deleted.",
    })
    setIsDeleteModalOpen(false)
  }

  const saveSchedule = (schedule: MaintenanceSchedule) => {
    if (currentSchedule) {
      // Edit existing schedule
      updateMaintenanceSchedule(schedule)
      toast({
        title: "Schedule Updated",
        description: "The maintenance schedule has been updated.",
      })
    } else {
      // Add new schedule
      addMaintenanceSchedule(schedule)
      toast({
        title: "Schedule Created",
        description: "The new maintenance schedule has been created.",
      })
    }
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Maintenance Schedules</h2>
        <Button onClick={handleAddSchedule}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Schedule
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Service Type</TableHead>
              <TableHead>Interval</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {maintenanceSchedules.map((schedule) => (
              <TableRow key={schedule.id}>
                <TableCell className="font-medium">{schedule.name}</TableCell>
                <TableCell>{schedule.serviceType}</TableCell>
                <TableCell>
                  {schedule.intervalValue} {schedule.intervalUnit}
                  {schedule.intervalValue > 1 ? "s" : ""}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="icon" onClick={() => handleEditSchedule(schedule)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDeleteSchedule(schedule)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {maintenanceSchedules.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No maintenance schedules found. Create your first schedule.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {isModalOpen && (
        <MaintenanceScheduleEditModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={saveSchedule}
          schedule={currentSchedule}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Maintenance Schedule"
          description="Are you sure you want to delete this maintenance schedule? This may affect assets using this schedule."
        />
      )}
    </div>
  )
}
