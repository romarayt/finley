"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Wallet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      const next = searchParams.get("next") ?? "/";
      router.replace(next);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({ error: "Неверный пароль" }));
      toast.error(data.error ?? "Неверный пароль");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-lg flex flex-col gap-6"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
          <Wallet className="h-6 w-6" />
        </div>
        <div className="text-center">
          <h1 className="font-serif text-2xl">Finley</h1>
          <p className="text-sm text-muted-foreground">Введи пароль, чтобы продолжить</p>
        </div>
      </div>

      <div>
        <Label htmlFor="password">Пароль</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          className="mt-1"
        />
      </div>

      <Button type="submit" size="lg" disabled={loading || !password}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Войти
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen grid place-items-center px-4 bg-gradient-to-b from-background to-muted/40">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
