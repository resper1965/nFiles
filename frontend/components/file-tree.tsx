"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronRight, ChevronDown, Folder, File, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  listFiles,
  listAllFilesUnderPrefix,
  userStoragePath,
  type StorageFile,
} from "@/lib/storage";

type FileTreeProps = {
  userId: string;
  projectName: string | null;
  selectedPaths: Set<string>;
  onSelectionChange: (paths: Set<string>) => void;
};

function getRelativePath(base: string, fullPath: string): string {
  return fullPath.startsWith(base + "/") ? fullPath.slice(base.length + 1) : fullPath;
}

export function FileTree({ userId, projectName, selectedPaths, onSelectionChange }: FileTreeProps) {
  const base = projectName ? userStoragePath(userId, projectName) : userId + "/";
  const [rootItems, setRootItems] = useState<StorageFile[]>([]);
  const [rootLoading, setRootLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [childrenMap, setChildrenMap] = useState<Record<string, StorageFile[]>>({});
  const [loadingNodes, setLoadingNodes] = useState<Set<string>>(new Set());

  const loadRoot = useCallback(async () => {
    if (!projectName) {
      setRootItems([]);
      setRootLoading(false);
      return;
    }
    setRootLoading(true);
    try {
      const items = await listFiles(userId, projectName, "");
      setRootItems(items);
    } finally {
      setRootLoading(false);
    }
  }, [userId, projectName]);

  useEffect(() => {
    loadRoot();
  }, [loadRoot]);

  const loadChildren = useCallback(
    async (relativePath: string) => {
      if (childrenMap[relativePath] !== undefined) return;
      setLoadingNodes((prev) => new Set(prev).add(relativePath));
      try {
        const items = await listFiles(userId, projectName!, relativePath);
        setChildrenMap((prev) => ({ ...prev, [relativePath]: items }));
      } finally {
        setLoadingNodes((prev) => {
          const next = new Set(prev);
          next.delete(relativePath);
          return next;
        });
      }
    },
    [userId, projectName, childrenMap]
  );

  const toggleExpand = useCallback(
    (relativePath: string) => {
      setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(relativePath)) {
          next.delete(relativePath);
        } else {
          next.add(relativePath);
          loadChildren(relativePath);
        }
        return next;
      });
    },
    [loadChildren]
  );

  const toggleFile = useCallback(
    (relativePath: string) => {
      onSelectionChange(
        (() => {
          const next = new Set(selectedPaths);
          if (next.has(relativePath)) next.delete(relativePath);
          else next.add(relativePath);
          return next;
        })()
      );
    },
    [selectedPaths, onSelectionChange]
  );

  const selectFolder = useCallback(
    async (prefix: string) => {
      const files = await listAllFilesUnderPrefix(userId, projectName!, prefix);
      const relPaths = files.map((f) => getRelativePath(base, f.path));
      onSelectionChange((() => {
        const next = new Set(selectedPaths);
        for (const r of relPaths) next.add(r);
        return next;
      })());
    },
    [userId, projectName, base, selectedPaths, onSelectionChange]
  );

  const renderNode = (file: StorageFile, relativePath: string, depth: number) => {
    const children = childrenMap[relativePath];
    const isExpanded = expanded.has(relativePath);
    const isLoading = loadingNodes.has(relativePath);
    const hasChildren = children !== undefined;
    const isFolder = hasChildren && children.length > 0;

    return (
      <div key={relativePath} className="flex flex-col">
        <div
          className="flex items-center gap-1 py-1 rounded hover:bg-muted/50"
          style={{ paddingLeft: depth * 16 + 4 }}
        >
          <button
            type="button"
            className="p-0.5 rounded hover:bg-muted"
            onClick={() => toggleExpand(relativePath)}
            aria-label={isExpanded ? "Recolher" : "Expandir"}
          >
            {hasChildren ? (
              isLoading ? (
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              ) : isExpanded ? (
                <ChevronDown className="size-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="size-4 text-muted-foreground" />
              )
            ) : (
              <span className="inline-block w-4" />
            )}
          </button>
          {isFolder ? (
            <Folder className="size-4 text-amber-500 shrink-0" />
          ) : (
            <File className="size-4 text-muted-foreground shrink-0" />
          )}
          <span className="truncate text-sm flex-1 min-w-0" title={file.name}>
            {file.name}
          </span>
          {isFolder ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => selectFolder(relativePath)}
            >
              Selecionar pasta
            </Button>
          ) : (
            <input
              type="checkbox"
              checked={selectedPaths.has(relativePath)}
              onChange={() => toggleFile(relativePath)}
              className="rounded border-input"
              aria-label={`Selecionar ${file.name}`}
            />
          )}
        </div>
        {isExpanded && isFolder && children && (
          <div>
            {children.map((child) => {
              const childRel = relativePath ? `${relativePath}/${child.name}` : child.name;
              return renderNode(child, childRel, depth + 1);
            })}
          </div>
        )}
      </div>
    );
  };

  if (!projectName) {
    return (
      <p className="text-sm text-muted-foreground p-2">
        Selecione um projeto na sidebar para ver a árvore.
      </p>
    );
  }

  if (rootLoading) {
    return (
      <div className="flex items-center gap-2 p-4 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        <span className="text-sm">Carregando árvore…</span>
      </div>
    );
  }

  if (rootItems.length === 0) {
    return (
      <p className="text-sm text-muted-foreground p-2">
        Nenhum arquivo neste projeto. Use Ingestão para enviar arquivos.
      </p>
    );
  }

  return (
    <div className="border rounded-md p-2 max-h-[400px] overflow-auto">
      {rootItems.map((file) => {
        const rel = file.path.startsWith(base + "/") ? file.path.slice(base.length + 1) : file.name;
        return renderNode(file, rel, 0);
      })}
    </div>
  );
}
