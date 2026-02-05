"use client";

import { PanelLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Notifications from "@/components/layout/header/notifications";
import ThemeSwitch from "@/components/layout/header/theme-switch";
import UserMenu from "@/components/layout/header/user-menu";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

type SiteHeaderProps = {
  user?: { email?: string | null } | null;
  signOut?: () => Promise<void>;
};

export function SiteHeader({ user, signOut }: SiteHeaderProps) {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="bg-background/40 sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 border-b backdrop-blur-md transition-[width,height] ease-linear md:rounded-tl-xl md:rounded-tr-xl">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2">
        <Button onClick={toggleSidebar} size="icon" variant="ghost" aria-label="Alternar menu">
          <PanelLeft className="size-5" />
        </Button>
        <Separator orientation="vertical" className="mx-2 h-4" />
        <div className="ml-auto flex items-center gap-2">
          <Notifications />
          <ThemeSwitch />
          <Separator orientation="vertical" className="mx-2 h-4" />
          {user != null && signOut != null ? (
            <UserMenu user={user} signOut={signOut} />
          ) : null}
        </div>
      </div>
    </header>
  );
}
