"use client";

import { PanelLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";

type SiteHeaderProps = {
  title?: string;
};

export function SiteHeader({ title }: SiteHeaderProps) {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="bg-background/95 sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 border-b backdrop-blur supports-[backdrop-filter]:bg-background/60 md:rounded-tl-xl md:rounded-tr-xl">
      <div className="flex w-full items-center gap-2 px-4">
        <Button onClick={toggleSidebar} size="icon" variant="ghost" aria-label="Alternar menu">
          <PanelLeftIcon className="size-5" />
        </Button>
        <Separator orientation="vertical" className="h-5" />
        {title ? (
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        ) : null}
      </div>
    </header>
  );
}
