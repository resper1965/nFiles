"use client";

import Link from "next/link";
import { useSidebar } from "@/components/ui/sidebar";
import { NessBrand, NFilesBrand } from "@/components/ness-brand";
import { cn } from "@/lib/utils";

export default function Logo() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Link
      href="/dashboard"
      className={cn(
        "block",
        "group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center"
      )}
    >
      {isCollapsed ? (
        <span className="text-sidebar-foreground font-montserrat text-xl font-medium">n</span>
      ) : (
        <>
          <NessBrand textClassName="text-sidebar-foreground" className="text-2xl" />
          <span className="text-muted-foreground mt-1 block text-base">
            <NFilesBrand textClassName="text-muted-foreground" className="text-base" />
          </span>
        </>
      )}
    </Link>
  );
}
