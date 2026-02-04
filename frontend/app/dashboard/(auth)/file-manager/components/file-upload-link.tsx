"use client";

import Link from "next/link";
import { UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FileUploadLink() {
  return (
    <Button asChild>
      <Link href="/dashboard/ingestao">
        <UploadIcon className="size-4" />
        <span className="hidden sm:inline">Upload</span>
      </Link>
    </Button>
  );
}
