"use client";

import { useState } from "react";
import { Clock, Mail, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface ScheduledReport {
  id: string;
  name: string;
  type: "sales" | "inventory" | "finance" | "customers";
  frequency: "daily" | "weekly" | "monthly";
  email: string;
  lastSent?: Date;
  nextRun: Date;
  enabled: boolean;
}

const mockScheduledReports: ScheduledReport[] = [
  {
    id: "1",
    name: "Weekly Sales Summary",
    type: "sales",
    frequency: "weekly",
    email: "manager@example.com",
    lastSent: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    nextRun: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    enabled: true,
  },
  {
    id: "2",
    name: "Monthly Inventory Report",
    type: "inventory",
    frequency: "monthly",
    email: "warehouse@example.com",
    lastSent: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    nextRun: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    enabled: true,
  },
];

export function ScheduledReports() {
  const [scheduledReports, setScheduledReports] =
    useState<ScheduledReport[]>(mockScheduledReports);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "sales" as ScheduledReport["type"],
    frequency: "weekly" as ScheduledReport["frequency"],
    email: "",
  });

  const handleCreate = () => {
    const newReport: ScheduledReport = {
      id: crypto.randomUUID(),
      ...formData,
      nextRun: new Date(),
      enabled: true,
    };
    setScheduledReports([...scheduledReports, newReport]);
    setFormData({
      name: "",
      type: "sales",
      frequency: "weekly",
      email: "",
    });
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    setScheduledReports(scheduledReports.filter((r) => r.id !== id));
  };

  const handleToggle = (id: string) => {
    setScheduledReports(
      scheduledReports.map((r) =>
        r.id === id ? { ...r, enabled: !r.enabled } : r
      )
    );
  };

  const getFrequencyBadge = (frequency: string) => {
    const colors: Record<string, string> = {
      daily: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      weekly: "bg-green-500/10 text-green-600 dark:text-green-400",
      monthly: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    };
    return colors[frequency] || "bg-gray-500/10 text-gray-600";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Scheduled Reports
            </CardTitle>
            <CardDescription>
              Automatically generate and email reports
            </CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Schedule Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule New Report</DialogTitle>
                <DialogDescription>
                  Set up automatic report generation and email delivery
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Report Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Weekly Sales Summary"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Report Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        type: value as ScheduledReport["type"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="inventory">Inventory</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="customers">Customers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        frequency: value as ScheduledReport["frequency"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="recipient@example.com"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate}>Schedule</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {scheduledReports.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No scheduled reports. Create one to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Next Run</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scheduledReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{report.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getFrequencyBadge(report.frequency)}>
                      {report.frequency}
                    </Badge>
                  </TableCell>
                  <TableCell>{report.email}</TableCell>
                  <TableCell>
                    {format(report.nextRun, "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={report.enabled ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => handleToggle(report.id)}
                    >
                      {report.enabled ? "Active" : "Paused"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(report.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}


