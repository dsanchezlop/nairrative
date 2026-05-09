"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Scroll, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Credenciales incorrectas. Verifica tu email y contraseña.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md bg-[#12122a] border-purple-900/40 text-white shadow-2xl">
      <CardHeader className="space-y-2 text-center">
        <div className="flex justify-start mb-1">
          <Link
            href="/"
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-purple-400 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Volver al inicio
          </Link>
        </div>
        <div className="flex justify-center mb-2">
          <Scroll className="h-10 w-10 text-purple-400" />
        </div>
        <CardTitle className="text-2xl font-bold text-purple-200">
          Bienvenido de nuevo
        </CardTitle>
        <CardDescription className="text-gray-400">
          Accede a tu grimorio de historias
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-900/30 border border-red-700/50 text-red-300 text-sm rounded-md px-3 py-2">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="aventurero@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-[#1a1a3a] border-purple-900/50 text-white placeholder:text-gray-600 focus-visible:ring-purple-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300">
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-[#1a1a3a] border-purple-900/50 text-white placeholder:text-gray-600 focus-visible:ring-purple-500"
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 border-t-0 bg-[#12122a] pt-2">
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold border border-purple-400/30"
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>
          <p className="text-sm text-gray-300">
            ¿No tienes cuenta?{" "}
            <Link
              href="/register"
              className="text-purple-300 hover:text-purple-200 underline underline-offset-2"
            >
              Regístrate
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
