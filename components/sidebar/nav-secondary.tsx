"use client";

import { type LucideIcon } from "lucide-react";
import { SupportDialog } from "./support-dialog";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
  }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            // Special handling for Support item
            if (item.title === "Supporto") {
              return (
                <SidebarMenuItem key={item.title}>
                  <SupportDialog>
                    <SidebarMenuButton size="sm" className="w-full">
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SupportDialog>
                </SidebarMenuItem>
              );
            }

            // Default handling for other items
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild size="sm">
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
