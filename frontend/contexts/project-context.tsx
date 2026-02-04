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

const STORAGE_KEY = "nfiles-current-project";

type ProjectContextValue = {
  /** Nome do projeto selecionado (pasta raiz). null = sem projeto (path legado userId/). */
  currentProject: string | null;
  setCurrentProject: (name: string | null) => void;
  /** Lista de nomes dos projetos (pastas raiz) do usuário. */
  projectNames: string[];
  loadProjects: () => Promise<void>;
  /** Cria um projeto (pasta raiz) e seleciona. */
  createProject: (name: string) => Promise<{ error: Error | null }>;
  loading: boolean;
};

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
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
    async (name: string): Promise<{ error: Error | null }> => {
      const trimmed = name.trim();
      if (!trimmed || !user?.id) return { error: new Error("Nome do projeto é obrigatório.") };
      const { error } = await createProjectStorage(user.id, trimmed);
      if (!error) {
        setCurrentProject(trimmed);
        await loadProjects();
      }
      return { error };
    },
    [user?.id, setCurrentProject, loadProjects]
  );

  const value: ProjectContextValue = {
    currentProject,
    setCurrentProject,
    projectNames,
    loadProjects,
    createProject,
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
