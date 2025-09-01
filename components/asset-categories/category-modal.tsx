"use client"

import { useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import type { AssetCategory } from "@/lib/types"

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (category: AssetCategory) => void
  categories: AssetCategory[]
  category: AssetCategory | null
}

// Removed parentId from form schema
const formSchema = z.object({
  name: z.string().min(1, "This field is required").max(100, "Text must be under 100 characters"),
  description: z.string().max(500, "Description must be under 500 characters").optional().nullable(),
})

export default function CategoryModal({ isOpen, onClose, onSave, categories, category }: CategoryModalProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || "",
      description: category?.description || "",
    },
  })

  // Update form when category changes
  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        description: category.description,
      })
    } else {
      form.reset({
        name: "",
        description: "",
      })
    }
  }, [category, form])

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log("[v0] CategoryModal onSubmit called with values:", values)

    const isDuplicate = categories.some((cat) => cat.name === values.name && cat.id !== category?.id)

    if (isDuplicate) {
      console.log("[v0] Duplicate category name found, setting error")
      form.setError("name", {
        type: "manual",
        message: "This name already exists",
      })
      return
    }

    console.log("[v0] No duplicate found, calling onSave...")
    const categoryData = {
      id: category?.id || "0", // Temporary ID, will be replaced in the parent component
      name: values.name,
      description: values.description,
    }
    console.log("[v0] Calling onSave with category data:", categoryData)

    onSave(categoryData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{category ? "Edit Category" : "Create Category"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name*</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter category name" />
                  </FormControl>
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
                    <Textarea {...field} placeholder="Enter description (optional)" value={field.value || ""} />
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
