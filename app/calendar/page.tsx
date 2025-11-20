"use client";

import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  setEvents,
  addEvent,
  updateEvent,
  deleteEvent,
  setSelectedEvent,
  setView,
  setCurrentDate,
  navigateDate,
  updateEventTime,
  setFilters,
  clearFilters,
} from "@/lib/store/slices/calendarSlice";
import { generateEvents } from "@/lib/data/demoData";
import { CalendarEvent } from "@/lib/data/demoData";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarView } from "@/components/calendar/CalendarView";
import { EventDialog } from "@/components/calendar/EventDialog";
import { CalendarFilters } from "@/components/calendar/CalendarFilters";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Filter,
} from "lucide-react";
import { format } from "date-fns";

export default function CalendarPage() {
  const dispatch = useAppDispatch();
  const { events, selectedEvent, view, currentDate, filters } = useAppSelector(
    (state) => state.calendar
  );
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [clickedDate, setClickedDate] = useState<Date | null>(null);

  useEffect(() => {
    const demoEvents = generateEvents(50);
    dispatch(setEvents(demoEvents));
  }, [dispatch]);

  const currentDateObj = useMemo(() => new Date(currentDate), [currentDate]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Category filter
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(event.category)
      ) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          event.title.toLowerCase().includes(searchLower) ||
          event.description?.toLowerCase().includes(searchLower) ||
          event.location?.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [events, filters]);

  const handleDateClick = (date: Date) => {
    setClickedDate(date);
    const endDate = new Date(date);
    endDate.setHours(date.getHours() + 1);
    setIsEventDialogOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    dispatch(setSelectedEvent(event));
    setIsEventDialogOpen(true);
  };

  const handleSaveEvent = (event: CalendarEvent) => {
    if (selectedEvent) {
      dispatch(updateEvent(event));
    } else {
      dispatch(addEvent(event));
    }
    dispatch(setSelectedEvent(null));
    setIsEventDialogOpen(false);
  };

  const handleDeleteEvent = (eventId: string) => {
    dispatch(deleteEvent(eventId));
    setIsEventDialogOpen(false);
  };

  const getViewTitle = () => {
    if (view === "month") {
      return format(currentDateObj, "MMMM yyyy");
    } else if (view === "week") {
      const weekStart = new Date(currentDateObj);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return `${format(weekStart, "MMM d")} - ${format(
        weekEnd,
        "MMM d, yyyy"
      )}`;
    } else {
      return format(currentDateObj, "EEEE, MMMM d, yyyy");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
            <p className="text-muted-foreground">
              Manage your schedule and events
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button
              size="sm"
              onClick={() => {
                dispatch(setSelectedEvent(null));
                setClickedDate(null);
                setIsEventDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </Button>
          </div>
        </div>

        {isFiltersOpen && (
          <Card>
            <CardHeader>
              <CardTitle>Filter Events</CardTitle>
              <CardDescription>
                Filter events by category or search
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CalendarFilters
                filters={filters}
                onFilterChange={(newFilters) =>
                  dispatch(setFilters(newFilters))
                }
                onClearFilters={() => dispatch(clearFilters())}
              />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => dispatch(navigateDate("prev"))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-lg font-semibold">{getViewTitle()}</div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => dispatch(navigateDate("next"))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => dispatch(navigateDate("today"))}
                >
                  Today
                </Button>
              </div>
              <Select
                value={view}
                onValueChange={(value) =>
                  dispatch(setView(value as "month" | "week" | "day"))
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <CalendarView
              events={filteredEvents}
              currentDate={currentDateObj}
              view={view}
              onDateClick={handleDateClick}
              onEventClick={handleEventClick}
            />
          </CardContent>
        </Card>

        <EventDialog
          open={isEventDialogOpen}
          onOpenChange={(open) => {
            setIsEventDialogOpen(open);
            if (!open) {
              dispatch(setSelectedEvent(null));
              setClickedDate(null);
            }
          }}
          event={selectedEvent}
          defaultStart={clickedDate || undefined}
          defaultEnd={
            clickedDate
              ? new Date(clickedDate.getTime() + 60 * 60 * 1000)
              : undefined
          }
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
        />
      </div>
    </MainLayout>
  );
}
