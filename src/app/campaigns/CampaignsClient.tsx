'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Swords, Trash2, Plus, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import type { Campaign } from '@/lib/types'
import { RPG_SYSTEMS } from '@/lib/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function CampaignsClient({ initialCampaigns }: { initialCampaigns: Campaign[] }) {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns)
  const [name, setName] = useState('')
  const [gameSystem, setGameSystem] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(initialCampaigns.length === 0)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setCreating(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('No autenticado.'); setCreating(false); return }
    const { data, error } = await supabase
      .from('campaigns')
      .insert({ name: name.trim(), game_system: gameSystem ?? '', user_id: user.id })
      .select()
      .single()
    if (error) {
      toast.error('Error al crear la campaña.')
    } else {
      toast.success('¡Campaña creada!')
      router.push(`/dashboard?campaign=${data.id}`)
    }
    setCreating(false)
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    setDeletingId(id)
    const supabase = createClient()
    const { error } = await supabase.from('campaigns').delete().eq('id', id)
    if (error) {
      toast.error('Error al eliminar la campaña.')
    } else {
      setCampaigns(campaigns.filter((c) => c.id !== id))
      toast.success('Campaña eliminada.')
    }
    setDeletingId(null)
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">

        <div className="text-center space-y-2">
          <Swords className="h-10 w-10 text-purple-400 mx-auto" />
          <h1 className="text-3xl font-bold text-purple-200 tracking-tight">NAIrrative</h1>
          <p className="text-gray-400">
            {campaigns.length > 0 ? 'Selecciona una campaña para continuar' : 'Crea tu primera campaña para empezar'}
          </p>
        </div>

        {campaigns.length > 0 && (
          <div className="space-y-2">
            {campaigns.map((c) => (
              <div
                key={c.id}
                onClick={() => router.push(`/dashboard?campaign=${c.id}`)}
                className="flex items-center justify-between gap-3 p-4 rounded-lg bg-[#12122a] border border-purple-900/30 hover:border-purple-500/60 hover:bg-[#1a1a3a] cursor-pointer transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-purple-200 group-hover:text-white transition-colors">{c.name}</p>
                  {c.game_system && (
                    <p className="text-sm text-gray-400 mt-0.5">{c.game_system}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => handleDelete(c.id, e)}
                    disabled={deletingId === c.id}
                    className="p-1.5 rounded text-gray-600 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-purple-400 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}

        {campaigns.length > 0 && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-2.5 rounded-lg border border-dashed border-purple-900/50 text-gray-400 hover:text-purple-300 hover:border-purple-600/60 transition-colors text-sm flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nueva campaña
          </button>
        )}

        {showForm && (
          <Card className="bg-[#12122a] border-purple-900/40 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-purple-200 text-base flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nueva campaña
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Nombre</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: La Maldición de Strahd"
                    required
                    autoFocus
                    className="bg-[#1a1a3a] border-purple-900/50 text-white placeholder:text-gray-600 focus-visible:ring-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Sistema de juego</Label>
                  <Select value={gameSystem ?? ''} onValueChange={(v) => setGameSystem(v)}>
                    <SelectTrigger className="bg-[#1a1a3a] border-purple-900/50 text-white focus:ring-purple-500">
                      <SelectValue placeholder="Selecciona un sistema..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a3a] border-purple-900/50 text-white">
                      {RPG_SYSTEMS.map((sys) => (
                        <SelectItem key={sys} value={sys} className="focus:bg-purple-900/40 focus:text-white">
                          {sys}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  {campaigns.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowForm(false)}
                      className="flex-1 text-gray-400 hover:text-white"
                    >
                      Cancelar
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={creating || !name.trim()}
                    className="flex-1 bg-purple-700 hover:bg-purple-600 text-white font-semibold"
                  >
                    {creating ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                        Creando...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Crear y entrar
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
