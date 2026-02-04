import Link from "next/link";
import { NessBrand, NFilesBrand } from "@/components/ness-brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen, Upload } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          <NessBrand /> — sistema de renomeação de arquivos (<NFilesBrand textClassName="text-muted-foreground" />).
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="size-5" />
              Ingestão
            </CardTitle>
            <CardDescription>
              Envie arquivos em lote ou um por vez para o Storage.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/ingestao">Abrir Ingestão</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="size-5" />
              File system
            </CardTitle>
            <CardDescription>
              Regras, preview e renomeação no Storage.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/file-manager">Abrir File system</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
