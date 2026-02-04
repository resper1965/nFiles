"use client";

import { useEffect, useState } from "react";
import { FileText, FolderKanban } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { listProjectNames, countAllFilesForUser } from "@/lib/storage";

export function SummaryCards() {
  const { user } = useAuth();
  const [projectsCount, setProjectsCount] = useState<number | null>(null);
  const [filesCount, setFilesCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    listProjectNames(user.id)
      .then((names) => {
        if (!cancelled) setProjectsCount(names.length);
      })
      .catch(() => {
        if (!cancelled) setProjectsCount(0);
      });
    countAllFilesForUser(user.id)
      .then((n) => {
        if (!cancelled) setFilesCount(n);
      })
      .catch(() => {
        if (!cancelled) setFilesCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const cards = [
    {
      type: "Projetos",
      icon: <FolderKanban className="size-6 text-blue-500" />,
      count: projectsCount ?? 0,
    },
    {
      type: "Arquivos",
      icon: <FileText className="size-6 text-green-500" />,
      count: filesCount ?? 0,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((item, key) => (
        <Card key={key} className="pb-0">
          <CardHeader>
            <CardTitle>{item.type}</CardTitle>
            <CardAction>{item.icon}</CardAction>
          </CardHeader>
          <CardContent>
            <div className="font-display text-2xl lg:text-3xl">
              {item.count}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
