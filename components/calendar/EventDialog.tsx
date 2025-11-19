"use client";

import { useState, useEffect } from "react";
import { CalendarEvent } from "@/lib/data/demoData";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: CalendarEvent | null;
  defaultStart?: Date;
  defaultEnd?: Date;
  onSave: (event: CalendarEvent) => void;
  onDelete?: (eventId: string) => void;
}

const categories: CalendarEvent["category"][] = [
  "meeting",
  "deadline",
  "reminder",
  "delivery",
  "payment",
  "appointment",
  "other",
];

const categoryColors: Record<CalendarEvent["category"], string> = {
  meeting: "#3b82f6",
  deadline: "#ef4444",
  reminder: "#f59e0b",
  delivery: "#10b981",
  payment: "#8b5cf6",
  appointment: "#ec4899",
  other: "#6b7280",
};

export function EventDialog({
  open,
  onOpenChange,
  event,
  defaultStart,
  defaultEnd,
  onSave,
  onDelete,
}: EventDialogProps) {
  const isEdit = !!event;
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start: "",
    end: "",
    allDay: false,
    category: "meeting" as CalendarEvent["category"],
    location: "",
    attendees: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (event) {
      const updateForm = () => {
        setFormData({
          title: event.title,
          description: event.description || "",
          start: format(new Date(event.start), "yyyy-MM-dd'T'HH:mm"),
          end: format(new Date(event.end), "yyyy-MM-dd'T'HH:mm"),
          allDay: event.allDay,
          category: event.category,
          location: event.location || "",
          attendees: event.attendees?.join(", ") || "",
        });
        setErrors({});
      };
      setTimeout(updateForm, 0);
    } else if (defaultStart && defaultEnd) {
      setFormData({
        title: "",
        description: "",
        start: format(defaultStart, "yyyy-MM-dd'T'HH:mm"),
        end: format(defaultEnd, "yyyy-MM-dd'T'HH:mm"),
        allDay: false,
        category: "meeting",
        location: "",
        attendees: "",
      });
      setErrors({});
    }
  }, [event, defaultStart, defaultEnd]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.start) {
      newErrors.start = "Start date is required";
    }
    if (!formData.end) {
      newErrors.end = "End date is required";
    }
    if (new Date(formData.end) < new Date(formData.start)) {
      newErrors.end = "End date must be after start date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const startDate = new Date(formData.start);
    const endDate = new Date(formData.end);

    if (formData.allDay) {
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    }

    const newEvent: CalendarEvent = {
      id: event?.id || crypto.randomUUID(),
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      allDay: formData.allDay,
      category: formData.category,
      color: categoryColors[formData.category],
      location: formData.location.trim() || undefined,
      attendees: formData.attendees
        ? formData.attendees.split(",").map((a) => a.trim())
        : undefined,
      createdBy: event?.createdBy || "Current User",
      createdAt: event?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newEvent);
    onOpenChange(false);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Event" : "Create Event"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update event details"
              : "Create a new calendar event"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Event title"
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Event description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    handleInputChange("category", value)
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        <span className="capitalize">{cat}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="Event location"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="allDay"
                checked={formData.allDay}
                onCheckedChange={(checked) =>
                  handleInputChange("allDay", checked)
                }
              />
              <Label htmlFor="allDay">All day event</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start">
                  Start <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="start"
                  type={formData.allDay ? "date" : "datetime-local"}
                  value={
                    formData.allDay
                      ? formData.start.split("T")[0]
                      : formData.start
                  }
                  onChange={(e) => handleInputChange("start", e.target.value)}
                  className={errors.start ? "border-destructive" : ""}
                />
                {errors.start && (
                  <p className="text-sm text-destructive">{errors.start}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="end">
                  End <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="end"
                  type={formData.allDay ? "date" : "datetime-local"}
                  value={
                    formData.allDay ? formData.end.split("T")[0] : formData.end
                  }
                  onChange={(e) => handleInputChange("end", e.target.value)}
                  className={errors.end ? "border-destructive" : ""}
                />
                {errors.end && (
                  <p className="text-sm text-destructive">{errors.end}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="attendees">Attendees (comma-separated)</Label>
              <Input
                id="attendees"
                value={formData.attendees}
                onChange={(e) => handleInputChange("attendees", e.target.value)}
                placeholder="John Doe, Jane Smith"
              />
            </div>
          </div>
          <DialogFooter>
            {isEdit && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  if (event) {
                    onDelete(event.id);
                    onOpenChange(false);
                  }
                }}
              >
                Delete
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEdit ? "Update" : "Create"} Event</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

