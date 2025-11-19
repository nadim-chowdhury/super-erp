"use client";

import { useState } from "react";
import { Settings2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { toggleWidget } from "@/lib/store/slices/dashboardSlice";

export function WidgetCustomizer() {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();
  const visibleWidgets = useAppSelector(
    (state) => state.dashboard.visibleWidgets
  );

  const widgets = [
    { key: "revenueTrends" as const, label: "Revenue Trends" },
    { key: "salesByCategory" as const, label: "Sales by Category" },
    { key: "inventoryTurnover" as const, label: "Inventory Turnover" },
    { key: "profitMargins" as const, label: "Profit Margins" },
    { key: "customerFunnel" as const, label: "Customer Acquisition Funnel" },
  ];

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Settings2 className="h-4 w-4" />
        Customize Widgets
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customize Dashboard Widgets</DialogTitle>
            <DialogDescription>
              Show or hide widgets on your dashboard
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {widgets.map((widget) => (
              <div
                key={widget.key}
                className="flex items-center justify-between space-x-2"
              >
                <Label htmlFor={widget.key} className="flex-1">
                  {widget.label}
                </Label>
                <Switch
                  id={widget.key}
                  checked={visibleWidgets[widget.key]}
                  onCheckedChange={() => dispatch(toggleWidget(widget.key))}
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
