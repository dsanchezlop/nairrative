'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Wand2 } from 'lucide-react'
import type { Category } from '@/lib/types'
import { toast } from 'sonner'

const CATEGORY_LABELS: Record<Category, string> = {
  personaje: '🧙 Personaje',
  historia: '📖 Historia / Aventura',
  mundo: '🌍 Worldbuilding',
  encuentro: '⚔️ Encuentro',
  otro: '✨ Otro',
}

const PLACEHOLDERS: Record<Category, string> = {
  personaje: 'Ej: Un elfo proscrito que fue traicionado por su propio clan y ahora busca redención como ladrón de sombras...',
  historia: 'Ej: Una aventura de investigación en una ciudad portuaria donde los pescadores desaparecen misteriosamente por las noches...',
  mundo: 'Ej: Una ciudad flotante gobernada por un gremio de magos que controla el comercio de runas en todo el continente...',
  encuentro: 'Ej: Un encuentro en una posada donde los jugadores descubren que el posadero es en realidad un dragón anciano disfrazado...',
  otro: 'Ej: Una espada maldita que susurra los nombres de sus víctimas anteriores...',
}

export default function GenerationForm({ onGenerated }: { onGenerated: () => void }) {
  const router = useRouter()
  const [category, setCategory] = useState<Category>('personaje')
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!prompt.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, category }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? 'Error al generar el contenido')
        return
      }

      toast.success('¡Texto generado y guardado!')
      setPrompt('')
      onGenerated()
      router.push(`/generation/${data.generation.id}`)
    } catch {
      toast.error('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-[#12122a] border-purple-900/40 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-200">
          <Wand2 className="h-5 w-5 text-purple-400" />
          Generar contenido
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Tipo de contenido</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger className="bg-[#1a1a3a] border-purple-900/50 text-white focus:ring-purple-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a3a] border-purple-900/50 text-white">
                {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
                  <SelectItem key={cat} value={cat} className="focus:bg-purple-900/40 focus:text-white">
                    {CATEGORY_LABELS[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Describe lo que necesitas</Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={PLACEHOLDERS[category]}
              rows={4}
              required
              className="bg-[#1a1a3a] border-purple-900/50 text-white placeholder:text-gray-600 focus-visible:ring-purple-500 resize-none"
            />
          </div>

          <Button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="w-full bg-purple-700 hover:bg-purple-600 text-white font-semibold"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                Generando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                Generar con IA
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
