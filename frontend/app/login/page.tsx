"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { NessBrand } from "@/components/ness-brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [authLoading, user, router]);

  function authErrorMessage(err: Error | null): string {
    if (!err) return "Erro ao entrar.";
    const msg = err.message;
    if (msg.includes("Supabase não configurado") || msg.includes("NEXT_PUBLIC_SUPABASE"))
      return "Autenticação não configurada. Configure NEXT_PUBLIC_SUPABASE_URL e a chave no .env.local ou na Vercel.";
    if (msg.includes("Invalid login credentials") || msg.includes("invalid_credentials"))
      return "Email ou senha incorretos.";
    if (msg.includes("Email not confirmed")) return "Confirme seu email antes de entrar.";
    return msg;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) {
      setError(authErrorMessage(err));
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-muted-foreground">Redirecionando…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <CardTitle className="mt-6 text-3xl font-bold tracking-tight">
            <NessBrand textClassName="text-foreground" className="text-3xl" />
          </CardTitle>
          <CardDescription className="mt-2 text-sm">
            Entre com email e senha para acessar o dashboard (n.files).
          </CardDescription>
        </div>

        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={authLoading || loading}
                    autoComplete="email"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={authLoading || loading}
                    autoComplete="current-password"
                    className="w-full"
                  />
                </div>
              </div>
              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={authLoading || loading}
              >
                {loading ? "Entrando…" : "Entrar"}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Área restrita. Entre para acessar o dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
