"use client";

import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  setActivities,
  addActivity,
  setFilters,
  clearFilters,
} from "@/lib/store/slices/activitySlice";
import { generateActivities } from "@/lib/data/demoData";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ActivityFeed } from "@/components/activity/ActivityFeed";
import { ActivityFilters } from "@/components/activity/ActivityFilters";
import { Button } from "@/components/ui/button";
import { RefreshCw, Filter } from "lucide-react";
import { Activity } from "@/lib/data/demoData";

export default function ActivityPage() {
  const dispatch = useAppDispatch();
  const { activities, filters } = useAppSelector((state) => state.activity);
  const [isLive, setIsLive] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Generate initial activities
  useEffect(() => {
    const demoActivities = generateActivities(150);
    dispatch(setActivities(demoActivities));
  }, [dispatch]);

  // Simulate real-time updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      // Generate a new random activity every 5-10 seconds
      const newActivity = generateActivities(1)[0];
      dispatch(addActivity(newActivity));
    }, Math.random() * 5000 + 5000); // 5-10 seconds

    return () => clearInterval(interval);
  }, [isLive, dispatch]);

  // Get unique users for filter
  const uniqueUsers = useMemo(() => {
    const users = new Set(activities.map((a) => a.userName));
    return Array.from(users).sort();
  }, [activities]);

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      // Module filter
      if (filters.module !== "all" && activity.module !== filters.module) {
        return false;
      }

      // Type filter
      if (filters.type !== "all" && activity.type !== filters.type) {
        return false;
      }

      // User filter
      if (filters.user !== "all" && activity.userName !== filters.user) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.start) {
        const startDate = new Date(filters.dateRange.start);
        const activityDate = new Date(activity.createdAt);
        if (activityDate < startDate) {
          return false;
        }
      }

      if (filters.dateRange.end) {
        const endDate = new Date(filters.dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        const activityDate = new Date(activity.createdAt);
        if (activityDate > endDate) {
          return false;
        }
      }

      return true;
    });
  }, [activities, filters]);

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    dispatch(setFilters(newFilters));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const handleActivityClick = (activity: Activity) => {
    if (activity.link) {
      window.location.href = activity.link;
    }
  };

  const handleRefresh = () => {
    const demoActivities = generateActivities(150);
    dispatch(setActivities(demoActivities));
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Activity Feed</h1>
            <p className="text-muted-foreground">
              Real-time activity stream of all system events
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLive(!isLive)}
            >
              <div
                className={`h-2 w-2 rounded-full mr-2 ${
                  isLive ? "bg-green-500 animate-pulse" : "bg-gray-400"
                }`}
              />
              {isLive ? "Live" : "Paused"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle>Filter Activities</CardTitle>
              <CardDescription>
                Filter activities by module, type, user, or date range
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                uniqueUsers={uniqueUsers}
              />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>
                  {filteredActivities.length} activity
                  {filteredActivities.length !== 1 ? "ies" : ""} found
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ActivityFeed
              activities={filteredActivities}
              onActivityClick={handleActivityClick}
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
