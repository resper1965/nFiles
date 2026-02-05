import {
  FileUploadLink,
  FileTreeSection,
  StorageStatusCard,
  SummaryCards,
} from "./components";

export default function FileManagerPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-row items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight lg:text-2xl">
            File system
          </h1>
          <p className="text-muted-foreground text-sm">
            Estrutura de arquivos do projeto: árvore de pastas e arquivos. Selecione o projeto e expanda as pastas para ver o conteúdo. Use Projetos para regras.
          </p>
        </div>
        <FileUploadLink />
      </div>
      <SummaryCards />
      <div className="mb-4 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FileTreeSection />
        </div>
        <StorageStatusCard />
      </div>
    </div>
  );
}
