import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, FolderInput, List, Upload } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <span className="font-semibold text-foreground">n.files</span>
          <span className="text-xs text-muted-foreground">ness</span>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Entrar</Link>
          </Button>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-8 p-8">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">n.files</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Sistema de renomeação de arquivos com ingestão, padrões de nomenclatura e file manager no Storage.
          </p>
        </div>
        <ul className="grid gap-3 text-sm text-muted-foreground max-w-sm text-left">
          <li className="flex items-center gap-2">
            <Upload className="size-4 shrink-0 text-foreground" />
            Ingestão em lote ou arquivo único no Storage
          </li>
          <li className="flex items-center gap-2">
            <FileText className="size-4 shrink-0 text-foreground" />
            Padrões de nomenclatura (seed, data, slug) e edição dos campos
          </li>
          <li className="flex items-center gap-2">
            <List className="size-4 shrink-0 text-foreground" />
            Preview nome atual → nome novo e aplicação no Storage
          </li>
          <li className="flex items-center gap-2">
            <FolderInput className="size-4 shrink-0 text-foreground" />
            Busca na lista e no preview; extensão preservada ao renomear
          </li>
        </ul>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/dashboard/file-manager">Abrir File manager</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
