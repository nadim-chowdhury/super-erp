"use client";

import { CalendarEvent } from "@/lib/data/demoData";
import { cn } from "@/lib/utils";
import { format, isSameDay } from "date-fns";
import {
  Clock,
  MapPin,
  Users,
  Repeat,
  Link as LinkIcon,
} from "lucide-react";

interface EventCardProps {
  event: CalendarEvent;
  onClick?: (event: CalendarEvent) => void;
  compact?: boolean;
}

export function EventCard({ event, onClick, compact = false }: EventCardProps) {
  const startDate = new Date(event.start);
  const endDate = new Date(event.end);
  const isSameDayEvent = isSameDay(startDate, endDate);

  const formatTime = (date: Date) => {
    return format(date, "h:mm a");
  };

  return (
    <div
      className={cn(
        "rounded-lg p-2 cursor-pointer transition-all hover:shadow-md",
        compact ? "text-xs" : "text-sm"
      )}
      style={{
        backgroundColor: `${event.color}15`,
        borderLeft: `3px solid ${event.color}`,
      }}
      onClick={() => onClick?.(event)}
    >
      <div className="font-medium truncate">{event.title}</div>
      {!event.allDay && (
        <div className="flex items-center gap-1 mt-1 text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>
            {formatTime(startDate)}
            {!isSameDayEvent && ` - ${formatTime(endDate)}`}
          </span>
        </div>
      )}
      {event.location && !compact && (
        <div className="flex items-center gap-1 mt-1 text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span className="truncate">{event.location}</span>
        </div>
      )}
      {event.attendees && event.attendees.length > 0 && !compact && (
        <div className="flex items-center gap-1 mt-1 text-muted-foreground">
          <Users className="h-3 w-3" />
          <span>{event.attendees.length} attendee(s)</span>
        </div>
      )}
      {event.recurring && !compact && (
        <div className="flex items-center gap-1 mt-1 text-muted-foreground">
          <Repeat className="h-3 w-3" />
          <span className="capitalize">
            {event.recurring.frequency}ly
          </span>
        </div>
      )}
      {event.associatedEntity && !compact && (
        <div className="flex items-center gap-1 mt-1 text-muted-foreground">
          <LinkIcon className="h-3 w-3" />
          <span className="truncate">{event.associatedEntity.name}</span>
        </div>
      )}
    </div>
  );
}

