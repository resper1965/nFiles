"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/contexts/auth-context";
import { createProject as createProjectStorage, listProjectNames } from "@/lib/storage";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

const STORAGE_KEY = "nfiles-current-project";

/** Retorna o access_token para chamadas à API: tenta getSession() no cliente; fallback session do AuthContext. */
async function getAccessTokenForApi(sessionFromAuth: { access_token?: string } | null): Promise<string | null> {
  const supabase = getSupabaseBrowser();
  if (supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) return session.access_token;
  }
  return sessionFromAuth?.access_token ?? null;
}

/** Parâmetros para criação de projeto com razão social e operadora (metadados + inferência). */
export type CreateProjectParams = {
  /** Nome da pasta do projeto. Se omitido, derivado de razao_social + operadora. */
  name?: string;
  razao_social: string;
  operadora: string;
  tipo_documento?: string;
  objeto_documento?: string;
};

function slugFromRazaoOperadora(razao: string, operadora: string): string {
  const combined = `${razao} ${operadora}`
    .replace(/[<>:"/\\|?*]/g, "_")
    .replace(/\s+/g, "_")
    .trim()
    .slice(0, 200);
  return combined || "projeto";
}

type ProjectContextValue = {
  /** Nome do projeto selecionado (pasta raiz). null = sem projeto (path legado userId/). */
  currentProject: string | null;
  setCurrentProject: (name: string | null) => void;
  /** Lista de nomes dos projetos (pastas raiz) do usuário. */
  projectNames: string[];
  loadProjects: () => Promise<void>;
  /** Cria um projeto (pasta raiz) e opcionalmente salva metadados. Aceita nome (legado) ou CreateProjectParams. */
  createProject: (nameOrParams: string | CreateProjectParams) => Promise<{ error: Error | null }>;
  /** Busca metadados do projeto (razão social, operadora, tipo, objeto). */
  getProjectMetadata: (projectName: string) => Promise<CreateProjectParams | null>;
  /** Atualiza metadados do projeto (name identifica o projeto). */
  updateProject: (projectName: string, params: Partial<Omit<CreateProjectParams, "name">>) => Promise<{ error: Error | null }>;
  /** Exclui projeto (Storage + tabela). Após exclusão, recarrega lista e limpa currentProject se era o excluído. */
  deleteProject: (projectName: string) => Promise<{ error: Error | null }>;
  loading: boolean;
};

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { user, session } = useAuth();
  const [currentProject, setCurrentProjectState] = useState<string | null>(null);
  const [projectNames, setProjectNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const setCurrentProject = useCallback((name: string | null) => {
    setCurrentProjectState(name);
    if (typeof window !== "undefined") {
      if (name) localStorage.setItem(STORAGE_KEY, name);
      else localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const loadProjects = useCallback(async () => {
    if (!user?.id) {
      setProjectNames([]);
      return;
    }
    try {
      const names = await listProjectNames(user.id);
      setProjectNames(names);
    } catch {
      setProjectNames([]);
    }
  }, [user?.id]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved?.trim()) setCurrentProjectState(saved.trim());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setProjectNames([]);
      return;
    }
    loadProjects();
  }, [user?.id, loadProjects]);

  const createProject = useCallback(
    async (nameOrParams: string | CreateProjectParams): Promise<{ error: Error | null }> => {
      if (!user?.id) return { error: new Error("Faça login para criar projeto.") };

      let name: string;
      let params: CreateProjectParams | undefined;

      if (typeof nameOrParams === "string") {
        name = nameOrParams.trim();
        if (!name) return { error: new Error("Nome do projeto é obrigatório.") };
      } else {
        const razao = String(nameOrParams.razao_social ?? "").trim();
        const operadora = String(nameOrParams.operadora ?? "").trim();
        if (!razao || !operadora) {
          return { error: new Error("Razão social e operadora são obrigatórios.") };
        }
        name = nameOrParams.name?.trim() || slugFromRazaoOperadora(razao, operadora);
        params = { name, razao_social: razao, operadora, tipo_documento: nameOrParams.tipo_documento, objeto_documento: nameOrParams.objeto_documento };
      }

      const { error } = await createProjectStorage(user.id, name);
      if (error) return { error };

      if (params) {
        try {
          const token = await getAccessTokenForApi(session);
          const res = await fetch("/api/projects", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify({
              name,
              razao_social: params.razao_social,
              operadora: params.operadora,
              tipo_documento: params.tipo_documento ?? null,
              objeto_documento: params.objeto_documento ?? null,
            }),
            credentials: "include",
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            return { error: new Error(typeof data.error === "string" ? data.error : "Erro ao salvar metadados do projeto.") };
          }
        } catch (e) {
          return { error: e instanceof Error ? e : new Error("Erro ao salvar metadados do projeto.") };
        }
      }

      setCurrentProject(name);
      await loadProjects();
      return { error: null };
    },
    [user?.id, session, setCurrentProject, loadProjects]
  );

  const getProjectMetadata = useCallback(
    async (projectName: string): Promise<CreateProjectParams | null> => {
      if (!projectName?.trim()) return null;
      try {
        const token = await getAccessTokenForApi(session);
        const res = await fetch(`/api/projects?name=${encodeURIComponent(projectName.trim())}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || data == null) return null;
        return {
          name: data.name,
          razao_social: data.razao_social ?? "",
          operadora: data.operadora ?? "",
          tipo_documento: data.tipo_documento ?? undefined,
          objeto_documento: data.objeto_documento ?? undefined,
        };
      } catch {
        return null;
      }
    },
    [session]
  );

  const updateProject = useCallback(
    async (
      projectName: string,
      params: Partial<Omit<CreateProjectParams, "name">>
    ): Promise<{ error: Error | null }> => {
      if (!user?.id || !projectName?.trim()) {
        return { error: new Error("Faça login e informe o nome do projeto.") };
      }
      const body: Record<string, string | null> = { name: projectName.trim() };
      if (params.razao_social !== undefined) body.razao_social = String(params.razao_social).trim() || null;
      if (params.operadora !== undefined) body.operadora = String(params.operadora).trim() || null;
      if (params.tipo_documento !== undefined) body.tipo_documento = String(params.tipo_documento).trim() || null;
      if (params.objeto_documento !== undefined) body.objeto_documento = String(params.objeto_documento).trim() || null;
      try {
        const token = await getAccessTokenForApi(session);
        const res = await fetch("/api/projects", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(body),
          credentials: "include",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          return { error: new Error(typeof data.error === "string" ? data.error : "Erro ao atualizar projeto.") };
        }
        await loadProjects();
        return { error: null };
      } catch (e) {
        return { error: e instanceof Error ? e : new Error("Erro ao atualizar projeto.") };
      }
    },
    [user?.id, session, loadProjects]
  );

  const deleteProject = useCallback(
    async (projectName: string): Promise<{ error: Error | null }> => {
      if (!user?.id || !projectName?.trim()) {
        return { error: new Error("Faça login e informe o nome do projeto.") };
      }
      const name = projectName.trim();
      try {
        const token = await getAccessTokenForApi(session);
        const res = await fetch(`/api/projects?name=${encodeURIComponent(name)}`, {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          return { error: new Error(typeof data.error === "string" ? data.error : "Erro ao excluir projeto.") };
        }
        if (currentProject === name) setCurrentProject(null);
        await loadProjects();
        return { error: null };
      } catch (e) {
        return { error: e instanceof Error ? e : new Error("Erro ao excluir projeto.") };
      }
    },
    [user?.id, session, currentProject, setCurrentProject, loadProjects]
  );

  const value: ProjectContextValue = {
    currentProject,
    setCurrentProject,
    projectNames,
    loadProjects,
    createProject,
    getProjectMetadata,
    updateProject,
    deleteProject,
    loading,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}

export function useProject(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error("useProject deve ser usado dentro de ProjectProvider.");
  }
  return ctx;
}
