"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function ProfileClient({ email }: { email: string }) {
  const router = useRouter();

  // Cambio de contraseña
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Eliminar cuenta
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showDeleteForm, setShowDeleteForm] = useState(false);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setSavingPassword(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error("Error al cambiar la contraseña.");
    } else {
      toast.success("Contraseña actualizada.");
      setNewPassword("");
      setConfirmPassword("");
    }
    setSavingPassword(false);
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== email) {
      toast.error("El email no coincide.");
      return;
    }
    setDeleting(true);
    const res = await fetch("/api/profile/delete", { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error ?? "Error al eliminar la cuenta.");
      setDeleting(false);
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] px-4 py-10">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-purple-200 flex items-center gap-2">
            <User className="h-6 w-6 text-purple-400" />
            Mi perfil
          </h1>
          <p className="text-sm text-gray-400">{email}</p>
        </div>

        {/* Cambiar contraseña */}
        <Card className="bg-[#12122a] border-purple-900/40 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-purple-200 text-base flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Cambiar contraseña
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Nueva contraseña</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="bg-[#1a1a3a] border-purple-900/50 text-white placeholder:text-gray-600 focus-visible:ring-purple-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Confirmar contraseña</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                  required
                  className="bg-[#1a1a3a] border-purple-900/50 text-white placeholder:text-gray-600 focus-visible:ring-purple-500"
                />
              </div>
              <Button
                type="submit"
                disabled={savingPassword || !newPassword || !confirmPassword}
                className="w-full bg-purple-700 hover:bg-purple-600 text-white font-semibold"
              >
                {savingPassword ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                    Guardando...
                  </span>
                ) : (
                  "Actualizar contraseña"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Eliminar cuenta */}
        <Card className="bg-[#12122a] border-red-900/40 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-300 text-base flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Eliminar cuenta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-400">
              Esta acción es{" "}
              <span className="text-red-400 font-medium">
                permanente e irreversible
              </span>
              . Se eliminarán tu cuenta, campañas y todo el contenido generado.
            </p>

            {!showDeleteForm ? (
              <Button
                variant="ghost"
                onClick={() => setShowDeleteForm(true)}
                className="w-full border border-red-900/50 text-red-400 hover:text-red-300 hover:bg-red-900/20"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Quiero eliminar mi cuenta
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-gray-300">
                    Escribe tu email{" "}
                    <span className="text-red-400 font-mono">{email}</span> para
                    confirmar
                  </Label>
                  <Input
                    type="email"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder={email}
                    className="bg-[#1a1a3a] border-red-900/50 text-white placeholder:text-gray-600 focus-visible:ring-red-500"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowDeleteForm(false);
                      setDeleteConfirm("");
                    }}
                    className="flex-1 text-gray-400 hover:text-white"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleDeleteAccount}
                    disabled={deleting || deleteConfirm !== email}
                    className="flex-1 bg-red-700 hover:bg-red-600 text-white font-semibold"
                  >
                    {deleting ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                        Eliminando...
                      </span>
                    ) : (
                      "Eliminar cuenta"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
