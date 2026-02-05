"use client";

import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { notifications, type Notification } from "./data";

export default function Notifications() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          <Bell className="size-5" />
          <span className="sr-only">Notificações</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notificações</DropdownMenuLabel>
        <ScrollArea className="h-[200px]">
          {notifications.map((item: Notification) => (
            <DropdownMenuItem key={item.id} className="flex flex-col items-start gap-0.5 p-3">
              <span className="font-medium">{item.title}</span>
              <span className="text-muted-foreground text-xs">{item.desc}</span>
              <span className="text-muted-foreground text-xs">{item.date}</span>
            </DropdownMenuItem>
          ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
