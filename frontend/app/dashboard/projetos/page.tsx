"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { useRules } from "@/contexts/rules-context";
import { NewRuleForm } from "@/components/new-rule-form";
import { PatternSelector } from "@/components/pattern-selector";
import { SeedFullOverridesForm } from "@/components/seed-full-overrides-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, FolderPlus, Trash2 } from "lucide-react";
import { useCustomPatterns } from "@/hooks/use-custom-patterns";
import { DEFAULT_PATTERN_ID, type SeedFullOverrides } from "@/lib/patterns";

const SEED_FULL_ID = "seed-full";

export default function ProjetosPage() {
  const { user } = useAuth();
  const { currentProject, setCurrentProject, projectNames, createProject, getProjectMetadata, loading: projectLoading } = useProject();
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
    </div>
  );
}
