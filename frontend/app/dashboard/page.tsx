import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          ness — sistema de renomeação de arquivos (n.files).
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="size-5" />
              File manager
            </CardTitle>
            <CardDescription>
              Ingestão (lote/único), regras, árvore, busca e preview de renomeações.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/file-manager">Abrir File manager</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
