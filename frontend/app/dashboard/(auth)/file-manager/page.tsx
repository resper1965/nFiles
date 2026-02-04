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
        <h1 className="text-xl font-bold tracking-tight lg:text-2xl">
          File Manager
        </h1>
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
