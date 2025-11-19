"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Truck,
  Boxes,
  UserCircle,
  DollarSign,
  FileText,
  Settings,
  Sparkles,
  Activity,
  FolderOpen,
  Calendar as CalendarIcon,
  LayoutGrid,
  MessageCircle,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    title: "Inventory",
    icon: Package,
    href: "/inventory",
  },
  {
    title: "Sales",
    icon: ShoppingCart,
    href: "/sales",
  },
  {
    title: "Customers",
    icon: Users,
    href: "/customers",
  },
  {
    title: "Suppliers",
    icon: Truck,
    href: "/suppliers",
  },
  {
    title: "Products",
    icon: Boxes,
    href: "/products",
  },
  {
    title: "Employees",
    icon: UserCircle,
    href: "/employees",
  },
  {
    title: "Finance",
    icon: DollarSign,
    href: "/finance",
  },
  {
    title: "Reports",
    icon: FileText,
    href: "/reports",
  },
  {
    title: "Activity",
    icon: Activity,
    href: "/activity",
  },
  {
    title: "Files",
    icon: FolderOpen,
    href: "/files",
  },
  {
    title: "Calendar",
    icon: CalendarIcon,
    href: "/calendar",
  },
  {
    title: "Kanban",
    icon: LayoutGrid,
    href: "/kanban",
  },
  {
    title: "Chat",
    icon: MessageCircle,
    href: "/chat",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup className="pt-0">
          <SidebarGroupLabel className="h-16 px-1">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 border border-primary/20">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-semibold leading-none bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Super ERP
                </span>
                <span className="text-xs text-muted-foreground mt-0.5">
                  Business Suite
                </span>
              </div>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent className="pt-2 border-t">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
