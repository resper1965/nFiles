"use client";

import { HardDrive } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function StorageStatusCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="size-4 text-muted-foreground" />
          Storage
        </CardTitle>
        <CardDescription>
          Supabase Storage — arquivos por projeto.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          Use a árvore ao lado para navegar pelos arquivos do projeto selecionado.
        </p>
      </CardContent>
    </Card>
  );
}
