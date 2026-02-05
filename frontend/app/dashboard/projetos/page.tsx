"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { useRules } from "@/contexts/rules-context";
import { NewRuleForm } from "@/components/new-rule-form";
import { PatternSelector } from "@/components/pattern-selector";
import { SeedFullOverridesForm } from "@/components/seed-full-overrides-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, FolderPlus, Pencil, Trash2 } from "lucide-react";
import { useCustomPatterns } from "@/hooks/use-custom-patterns";
import { DEFAULT_PATTERN_ID, type SeedFullOverrides } from "@/lib/patterns";

const SEED_FULL_ID = "seed-full";

export default function ProjetosPage() {
  const { user } = useAuth();
  const {
    currentProject,
    setCurrentProject,
    projectNames,
    createProject,
    getProjectMetadata,
    updateProject,
    deleteProject,
    loadProjects,
    loading: projectLoading,
  } = useProject();
  const { setActiveRule } = useRules();
  const { patterns, addPattern, removePattern, isCustomId } = useCustomPatterns();
  const [selectedPatternId, setSelectedPatternId] = useState(DEFAULT_PATTERN_ID);
  const [patternOverrides, setPatternOverrides] = useState<SeedFullOverrides>({});
  const [newRuleOpen, setNewRuleOpen] = useState(false);
  const [newProjectRazao, setNewProjectRazao] = useState("");
  const [newProjectOperadora, setNewProjectOperadora] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [projectMeta, setProjectMeta] = useState<{ razao_social: string; operadora: string } | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState<string | null>(null);
  const [editRazao, setEditRazao] = useState("");
  const [editOperadora, setEditOperadora] = useState("");
  const [editTipo, setEditTipo] = useState("");
  const [editObjeto, setEditObjeto] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteName, setDeleteName] = useState<string | null>(null);
  const [deleteDeleting, setDeleteDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [deleteAllDeleting, setDeleteAllDeleting] = useState(false);
  const [deleteAllError, setDeleteAllError] = useState<string | null>(null);

  useEffect(() => {
    if (patterns.length > 0 && !patterns.some((p) => p.id === selectedPatternId)) {
      setSelectedPatternId(DEFAULT_PATTERN_ID);
    }
  }, [patterns, selectedPatternId]);

  useEffect(() => {
    if (!currentProject?.trim()) {
      setProjectMeta(null);
      return;
    }
    let cancelled = false;
    getProjectMetadata(currentProject).then((meta) => {
      if (!cancelled && meta) {
        setProjectMeta({
          razao_social: meta.razao_social ?? "",
          operadora: meta.operadora ?? "",
        });
        setPatternOverrides((prev) => ({
          ...prev,
          razao: meta.razao_social || prev.razao,
          operadora: meta.operadora || prev.operadora,
        }));
      } else {
        setProjectMeta(null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [currentProject, getProjectMetadata]);

  useEffect(() => {
    setActiveRule(selectedPatternId, patternOverrides);
  }, [selectedPatternId, patternOverrides, setActiveRule]);

  const handleCreateProject = async () => {
    const razao = newProjectRazao.trim();
    const operadora = newProjectOperadora.trim();
    if (!razao || !operadora) {
      setCreateError("Razão social e operadora são obrigatórios.");
      return;
    }
    setCreating(true);
    setCreateError(null);
    const { error } = await createProject({
      name: newProjectName.trim() || undefined,
      razao_social: razao,
      operadora,
      // tipo e objeto não no projeto: cada documento pode ter valor diferente
    });
    setCreating(false);
    if (error) setCreateError(error.message);
    else {
      setNewProjectRazao("");
      setNewProjectOperadora("");
      setNewProjectName("");
    }
  };

  const openEdit = useCallback(
    (name: string) => {
      setEditName(name);
      setEditError(null);
      setEditOpen(true);
      getProjectMetadata(name).then((meta) => {
        if (meta) {
          setEditRazao(meta.razao_social ?? "");
          setEditOperadora(meta.operadora ?? "");
          setEditTipo(meta.tipo_documento ?? "");
          setEditObjeto(meta.objeto_documento ?? "");
        } else {
          setEditRazao("");
          setEditOperadora("");
          setEditTipo("");
          setEditObjeto("");
        }
      });
    },
    [getProjectMetadata]
  );

  const saveEdit = async () => {
    if (!editName?.trim()) return;
    setEditSaving(true);
    setEditError(null);
    const { error } = await updateProject(editName.trim(), {
      razao_social: editRazao.trim() || undefined,
      operadora: editOperadora.trim() || undefined,
      tipo_documento: editTipo.trim() || undefined,
      objeto_documento: editObjeto.trim() || undefined,
    });
    setEditSaving(false);
    if (error) setEditError(error.message);
    else setEditOpen(false);
  };

  const openDelete = useCallback((name: string) => {
    setDeleteName(name);
    setDeleteError(null);
    setDeleteOpen(true);
  }, []);

  const confirmDelete = async () => {
    if (!deleteName?.trim()) return;
    setDeleteDeleting(true);
    setDeleteError(null);
    const { error } = await deleteProject(deleteName.trim());
    setDeleteDeleting(false);
    if (error) setDeleteError(error.message);
    else setDeleteOpen(false);
  };

  const confirmDeleteAll = async () => {
    setDeleteAllDeleting(true);
    setDeleteAllError(null);
    let err: string | null = null;
    for (const name of projectNames) {
      const { error } = await deleteProject(name);
      if (error) err = error.message;
    }
    setDeleteAllDeleting(false);
    if (err) setDeleteAllError(err);
    else setDeleteAllOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Projetos</h1>
        <p className="text-muted-foreground">
          Crie e gerencie projetos. Regras de renomeação.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Projeto</CardTitle>
          <CardDescription>
            Selecione o projeto para regras, ou crie um novo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {projectLoading ? (
            <p className="text-sm text-muted-foreground">Carregando…</p>
          ) : (
            <>
              <div className="flex flex-col gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="projeto-select" className="text-xs">Projeto ativo</Label>
                  <select
                    id="projeto-select"
                    className="flex h-9 w-full max-w-xs rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground"
                    value={currentProject ?? ""}
                    onChange={(e) => setCurrentProject(e.target.value || null)}
                  >
                    <option value="">— Selecione —</option>
                    {projectNames.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-muted-foreground">
                    Pasta principal = nome do projeto. Subpasta pode ser razão+operadora (na ingestão).
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2 max-w-xl">
                    <div className="space-y-1.5">
                      <Label htmlFor="novo-razao" className="text-xs">Razão social do cliente *</Label>
                      <Input
                        id="novo-razao"
                        placeholder="Ex.: INGREDION"
                        className="h-9"
                        value={newProjectRazao}
                        onChange={(e) => setNewProjectRazao(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="novo-operadora" className="text-xs">Operadora *</Label>
                      <Input
                        id="novo-operadora"
                        placeholder="Ex.: UNIMED NACIONAL"
                        className="h-9"
                        value={newProjectOperadora}
                        onChange={(e) => setNewProjectOperadora(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5 max-w-xl">
                    <Label htmlFor="novo-projeto" className="text-xs">Nome da pasta do projeto (opcional)</Label>
                    <Input
                      id="novo-projeto"
                      placeholder="Deixe em branco = nome derivado de razão + operadora"
                      className="h-9"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleCreateProject())}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleCreateProject}
                      disabled={creating || !newProjectRazao.trim() || !newProjectOperadora.trim()}
                    >
                      <FolderPlus className="mr-2 size-4" />
                      {creating ? "Criando…" : "Criar projeto"}
                    </Button>
                  </div>
                </div>
              </div>
              {projectNames.length > 0 && (
                <div className="mt-4 space-y-2 border-t pt-4">
                  <p className="text-xs font-medium text-muted-foreground">Projetos existentes</p>
                  <ul className="flex flex-col gap-2">
                    {projectNames.map((name) => (
                      <li
                        key={name}
                        className="flex items-center justify-between gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm"
                      >
                        <span className="truncate font-medium">{name}</span>
                        <div className="flex shrink-0 gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(name)}
                            aria-label={`Editar projeto ${name}`}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => openDelete(name)}
                            aria-label={`Excluir projeto ${name}`}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setDeleteAllOpen(true)}
                  >
                    <Trash2 className="mr-2 size-4" />
                    Apagar todos os projetos
                  </Button>
                </div>
              )}
              {createError && <p className="text-xs text-destructive">{createError}</p>}
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5" />
            Regras
          </CardTitle>
          <CardDescription>
            Padrões de renomeação (melhores práticas + ingerência do usuário). O processo de renomeação dos arquivos ocorre na página <strong>Ingestão</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PatternSelector
            value={selectedPatternId}
            onValueChange={setSelectedPatternId}
            patterns={patterns}
          />
          <SeedFullOverridesForm
            patternId={selectedPatternId}
            value={patternOverrides}
            onChange={setPatternOverrides}
            projectRazao={projectMeta?.razao_social}
            projectOperadora={projectMeta?.operadora}
          />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setNewRuleOpen(true)}>
              Nova regra
            </Button>
            {isCustomId(selectedPatternId) && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  removePattern(selectedPatternId);
                  setSelectedPatternId(DEFAULT_PATTERN_ID);
                }}
              >
                <Trash2 className="size-4" />
                Remover regra
              </Button>
            )}
          </div>
          <NewRuleForm
            open={newRuleOpen}
            onOpenChange={setNewRuleOpen}
            onSubmit={(label, template) => {
              const added = addPattern(label, template);
              setSelectedPatternId(added.id);
            }}
          />
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) setEditError(null); }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Editar projeto</DialogTitle>
            <DialogDescription>
              {editName ? `Altere razão social, operadora e metadados do projeto “${editName}". O nome da pasta não é alterado.` : "Carregando…"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="edit-razao">Razão social</Label>
                <Input
                  id="edit-razao"
                  value={editRazao}
                  onChange={(e) => setEditRazao(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-operadora">Operadora</Label>
                <Input
                  id="edit-operadora"
                  value={editOperadora}
                  onChange={(e) => setEditOperadora(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="edit-tipo">Tipo documento</Label>
                <Input
                  id="edit-tipo"
                  value={editTipo}
                  onChange={(e) => setEditTipo(e.target.value)}
                  placeholder="Em branco = inferir (IA/metadado)"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-objeto">Objeto documento</Label>
                <Input
                  id="edit-objeto"
                  value={editObjeto}
                  onChange={(e) => setEditObjeto(e.target.value)}
                  placeholder="Em branco = inferir (IA/metadado)"
                  className="h-9"
                />
              </div>
            </div>
          </div>
          {editError && <p className="text-xs text-destructive">{editError}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={saveEdit} disabled={editSaving}>
              {editSaving ? "Salvando…" : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={(open) => { setDeleteOpen(open); if (!open) setDeleteError(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir projeto</DialogTitle>
            <DialogDescription>
              O projeto &quot;{deleteName}&quot; e todos os arquivos na pasta serão removidos permanentemente. Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteDeleting}
            >
              {deleteDeleting ? "Excluindo…" : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteAllOpen} onOpenChange={(open) => { setDeleteAllOpen(open); if (!open) setDeleteAllError(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apagar todos os projetos</DialogTitle>
            <DialogDescription>
              Todos os projetos e todos os arquivos serão removidos permanentemente. Esta ação não pode ser desfeita. Confirma?
            </DialogDescription>
          </DialogHeader>
          {deleteAllError && <p className="text-sm text-destructive">{deleteAllError}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteAllOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDeleteAll}
              disabled={deleteAllDeleting}
            >
              {deleteAllDeleting ? "Apagando…" : "Apagar todos"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
