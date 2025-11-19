"use client";

import { useMemo } from "react";
import { Activity } from "@/lib/data/demoData";
import { ActivityItem } from "./ActivityItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  format,
  isToday,
  isYesterday,
  startOfWeek,
  isThisWeek,
} from "date-fns";

interface ActivityFeedProps {
  activities: Activity[];
  onActivityClick?: (activity: Activity) => void;
}

export function ActivityFeed({
  activities,
  onActivityClick,
}: ActivityFeedProps) {
  const groupedActivities = useMemo(() => {
    const groups: {
      label: string;
      activities: Activity[];
    }[] = [];

    const today: Activity[] = [];
    const yesterday: Activity[] = [];
    const thisWeek: Activity[] = [];
    const older: Activity[] = [];

    const now = new Date();
    const weekStart = startOfWeek(now);

    activities.forEach((activity) => {
      const date = new Date(activity.createdAt);

      if (isToday(date)) {
        today.push(activity);
      } else if (isYesterday(date)) {
        yesterday.push(activity);
      } else if (isThisWeek(date)) {
        thisWeek.push(activity);
      } else {
        older.push(activity);
      }
    });

    if (today.length > 0) {
      groups.push({ label: "Today", activities: today });
    }
    if (yesterday.length > 0) {
      groups.push({ label: "Yesterday", activities: yesterday });
    }
    if (thisWeek.length > 0) {
      groups.push({ label: "This Week", activities: thisWeek });
    }
    if (older.length > 0) {
      // Group older activities by date
      const olderByDate = older.reduce((acc, activity) => {
        const date = new Date(activity.createdAt);
        const dateKey = format(date, "MMMM d, yyyy");
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(activity);
        return acc;
      }, {} as Record<string, Activity[]>);

      Object.entries(olderByDate).forEach(([dateKey, activities]) => {
        groups.push({ label: dateKey, activities });
      });
    }

    return groups;
  }, [activities]);

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">No activities found</p>
        <p className="text-sm text-muted-foreground mt-2">
          Activities will appear here as they occur
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-300px)]">
      <div className="space-y-6 pr-4">
        {groupedActivities.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-3">
            <div className="sticky top-0 bg-accent z-10 px-4 py-2 rounded-lg">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {group.label}
              </h3>
            </div>
            <div className="space-y-1">
              {group.activities.map((activity) => (
                <div
                  key={activity.id}
                  onClick={() => onActivityClick?.(activity)}
                  className="cursor-pointer"
                >
                  <ActivityItem activity={activity} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
