"use client";

import { useMemo } from "react";
import { CalendarEvent } from "@/lib/data/demoData";
import { EventCard } from "./EventCard";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addWeeks,
  startOfDay,
  addDays,
  getHours,
  getMinutes,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

interface CalendarViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  view: "month" | "week" | "day";
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onEventDrag?: (eventId: string, newStart: Date, newEnd: Date) => void;
}

export function CalendarView({
  events,
  currentDate,
  view,
  onDateClick,
  onEventClick,
  onEventDrag,
}: CalendarViewProps) {
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);

      if (view === "month") {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        return eventStart <= monthEnd && eventEnd >= monthStart;
      } else if (view === "week") {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
        return eventStart <= weekEnd && eventEnd >= weekStart;
      } else {
        const dayStart = startOfDay(currentDate);
        const dayEnd = addDays(dayStart, 1);
        return eventStart < dayEnd && eventEnd > dayStart;
      }
    });
  }, [events, currentDate, view]);

  if (view === "month") {
    return <MonthView
      events={filteredEvents}
      currentDate={currentDate}
      onDateClick={onDateClick}
      onEventClick={onEventClick}
    />;
  } else if (view === "week") {
    return <WeekView
      events={filteredEvents}
      currentDate={currentDate}
      onDateClick={onDateClick}
      onEventClick={onEventClick}
    />;
  } else {
    return <DayView
      events={filteredEvents}
      currentDate={currentDate}
      onDateClick={onDateClick}
      onEventClick={onEventClick}
    />;
  }
}

function MonthView({
  events,
  currentDate,
  onDateClick,
  onEventClick,
}: {
  events: CalendarEvent[];
  currentDate: Date;
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
}) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return (
        (isSameDay(eventStart, day) || isSameDay(eventEnd, day)) ||
        (eventStart <= day && eventEnd >= day)
      );
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={idx}
              className={cn(
                "min-h-[100px] border rounded-lg p-2 cursor-pointer hover:bg-muted/50 transition-colors",
                !isCurrentMonth && "opacity-40",
                isToday && "ring-2 ring-primary"
              )}
              onClick={() => onDateClick?.(day)}
            >
              <div
                className={cn(
                  "text-sm font-medium mb-1",
                  isToday && "text-primary"
                )}
              >
                {format(day, "d")}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={onEventClick}
                    compact
                  />
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground px-2">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({
  events,
  currentDate,
  onDateClick,
  onEventClick,
}: {
  events: CalendarEvent[];
  currentDate: Date;
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
}) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(weekStart, i)
  );
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      const dayStart = startOfDay(day);
      const dayEnd = addDays(dayStart, 1);
      return eventStart < dayEnd && eventEnd > dayStart;
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-8 gap-1 border-b pb-2">
        <div className="text-sm font-medium text-muted-foreground"></div>
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              "text-center p-2 rounded cursor-pointer hover:bg-muted/50",
              isSameDay(day, new Date()) && "bg-primary/10 text-primary font-semibold"
            )}
            onClick={() => onDateClick?.(day)}
          >
            <div className="text-xs text-muted-foreground">
              {format(day, "EEE")}
            </div>
            <div className="text-lg font-medium">{format(day, "d")}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-8 gap-1">
        <div className="space-y-1">
          {hours.map((hour) => (
            <div
              key={hour}
              className="h-16 text-xs text-muted-foreground pr-2 text-right"
            >
              {format(new Date().setHours(hour, 0, 0, 0), "h a")}
            </div>
          ))}
        </div>
        {weekDays.map((day) => {
          const dayEvents = getEventsForDay(day);
          return (
            <div key={day.toISOString()} className="space-y-1">
              {hours.map((hour) => {
                const hourEvents = dayEvents.filter((event) => {
                  if (event.allDay) return false;
                  const eventStart = new Date(event.start);
                  return getHours(eventStart) === hour;
                });
                return (
                  <div
                    key={hour}
                    className="h-16 border-b border-l p-1 cursor-pointer hover:bg-muted/30"
                    onClick={() =>
                      onDateClick?.(
                        new Date(day.setHours(hour, 0, 0, 0))
                      )
                    }
                  >
                    {hourEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onClick={onEventClick}
                        compact
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DayView({
  events,
  currentDate,
  onDateClick,
  onEventClick,
}: {
  events: CalendarEvent[];
  currentDate: Date;
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
}) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dayStart = startOfDay(currentDate);

  const getEventsForHour = (hour: number) => {
    return events.filter((event) => {
      if (event.allDay) return hour === 0;
      const eventStart = new Date(event.start);
      return getHours(eventStart) === hour;
    });
  };

  const allDayEvents = events.filter((event) => event.allDay);

  return (
    <div className="space-y-4">
      {allDayEvents.length > 0 && (
        <div className="border rounded-lg p-4 space-y-2">
          <div className="text-sm font-medium text-muted-foreground mb-2">
            All Day
          </div>
          {allDayEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onClick={onEventClick}
            />
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-1">
        <div className="space-y-1">
          {hours.map((hour) => (
            <div
              key={hour}
              className="h-20 text-xs text-muted-foreground pr-2 text-right"
            >
              {format(new Date().setHours(hour, 0, 0, 0), "h a")}
            </div>
          ))}
        </div>
        <div className="space-y-1">
          {hours.map((hour) => {
            const hourEvents = getEventsForHour(hour);
            return (
              <div
                key={hour}
                className="h-20 border-b p-2 cursor-pointer hover:bg-muted/30"
                onClick={() =>
                  onDateClick?.(new Date(dayStart.setHours(hour, 0, 0, 0)))
                }
              >
                {hourEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={onEventClick}
                    compact
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

