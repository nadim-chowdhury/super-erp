"use client";

import Link from "next/link";
import { Activity } from "@/lib/data/demoData";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Package,
  ShoppingCart,
  Users,
  Truck,
  Boxes,
  UserCircle,
  DollarSign,
  Settings,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  MessageSquare,
  FileText,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityItemProps {
  activity: Activity;
}

const moduleIcons = {
  inventory: Package,
  sales: ShoppingCart,
  customers: Users,
  suppliers: Truck,
  products: Boxes,
  employees: UserCircle,
  finance: DollarSign,
  system: Settings,
};

const typeIcons = {
  create: Plus,
  update: Edit,
  delete: Trash2,
  system: AlertCircle,
  comment: MessageSquare,
  file: FileText,
};

const typeColors = {
  create: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  update: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  delete: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  system: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  comment: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  file: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
};

export function ActivityItem({ activity }: ActivityItemProps) {
  const ModuleIcon = moduleIcons[activity.module] || Settings;
  const TypeIcon = typeIcons[activity.type] || AlertCircle;

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return "Just now";
      if (diffInSeconds < 3600)
        return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400)
        return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 604800)
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "Recently";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const content = (
    <div className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-primary/10 text-primary">
          {getInitials(activity.userName)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">{activity.userName}</span>
              <Badge
                variant="outline"
                className={cn("text-xs", typeColors[activity.type])}
              >
                <TypeIcon className="h-3 w-3 mr-1" />
                {activity.type}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <ModuleIcon className="h-3 w-3 mr-1" />
                {activity.module}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {activity.description}
            </p>
            {activity.metadata && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {activity.metadata.orderNumber && (
                  <span className="text-xs text-muted-foreground">
                    Order: {activity.metadata.orderNumber}
                  </span>
                )}
                {activity.metadata.amount && (
                  <span className="text-xs text-muted-foreground">
                    Amount: ${activity.metadata.amount}
                  </span>
                )}
                {activity.metadata.status && (
                  <span className="text-xs text-muted-foreground">
                    Status: {activity.metadata.status}
                  </span>
                )}
              </div>
            )}
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatTime(activity.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );

  if (activity.link) {
    return (
      <Link href={activity.link} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

