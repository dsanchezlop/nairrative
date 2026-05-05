'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Save, Trash2, ArrowLeft, Pencil, X, Wand2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Category, Generation } from '@/lib/types'
import Link from 'next/link'

const CATEGORY_LABELS: Record<Category, string> = {
  personaje: '🧙 Personaje',
  historia: '📖 Historia',
  mundo: '🌍 Mundo',
  encuentro: '⚔️ Encuentro',
  otro: '✨ Otro',
}

const CATEGORY_COLORS: Record<Category, string> = {
  personaje: 'bg-violet-900/50 text-violet-300 border-violet-700/50',
  historia: 'bg-amber-900/50 text-amber-300 border-amber-700/50',
  mundo: 'bg-emerald-900/50 text-emerald-300 border-emerald-700/50',
  encuentro: 'bg-red-900/50 text-red-300 border-red-700/50',
  otro: 'bg-blue-900/50 text-blue-300 border-blue-700/50',
}

export default function GenerationEditor({ generation }: { generation: Generation }) {
  const router = useRouter()
  const [title, setTitle] = useState(generation.title)
  const [content, setContent] = useState(generation.content)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [continuePrompt, setContinuePrompt] = useState('')
  const [continuing, setContinuing] = useState(false)

  async function handleContinue() {
    if (!continuePrompt.trim()) return
    setContinuing(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: continuePrompt,
          category: generation.category,
          parentContent: content,
          returnOnly: true,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Error al generar la continuación')
        return
      }

      const separator = `\n\n---\n\n**Continuación:** ${continuePrompt.trim()}\n\n`
      const updatedContent = content + separator + data.content

      const supabase = createClient()
      const { error } = await supabase
        .from('generations')
        .update({ content: updatedContent })
        .eq('id', generation.id)

      if (error) {
        toast.error('Error al guardar la continuación.')
        return
      }

      setContent(updatedContent)
      setContinuePrompt('')
      toast.success('¡Continuación añadida!')
    } catch {
      toast.error('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setContinuing(false)
    }
  }

  async function handleSave() {
    if (!title.trim() || !content.trim()) {
      toast.error('El título y el contenido no pueden estar vacíos.')
      return
    }
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('generations')
      .update({ title: title.trim(), content: content.trim() })
      .eq('id', generation.id)

    if (error) {
      toast.error('Error al guardar los cambios.')
    } else {
      toast.success('Cambios guardados.')
      setEditing(false)
    }
    setSaving(false)
  }

  function handleCancelEdit() {
    setTitle(generation.title)
    setContent(generation.content)
    setEditing(false)
  }

  async function handleDelete() {
    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('generations')
      .delete()
      .eq('id', generation.id)

    if (error) {
      toast.error('Error al eliminar.')
      setDeleting(false)
      setConfirmDelete(false)
      return
    }

    toast.success('Texto eliminado.')
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-gray-400 hover:text-white hover:bg-purple-900/30')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver
        </Link>
      </div>

      <Card className="bg-[#12122a] border-purple-900/40 text-white">
        <CardHeader className="space-y-3 pb-3">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className={`text-xs ${CATEGORY_COLORS[generation.category as Category]}`}
            >
              {CATEGORY_LABELS[generation.category as Category]}
            </Badge>
            <span className="text-xs text-gray-500">
              Creado el{' '}
              {new Date(generation.created_at).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            {generation.updated_at !== generation.created_at && (
              <span className="text-xs text-gray-600">
                · Editado el{' '}
                {new Date(generation.updated_at).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            )}
          </div>

          {/* Título */}
          {editing ? (
            <div className="space-y-1">
              <Label className="text-gray-400 text-xs">Título</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-[#1a1a3a] border-purple-900/50 text-white text-lg font-bold focus-visible:ring-purple-500"
              />
            </div>
          ) : (
            <h1 className="text-xl font-bold text-purple-100">{title}</h1>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Prompt original */}
          <div className="bg-[#0d0d1a]/60 rounded-md p-3 border border-purple-900/20">
            <p className="text-xs text-gray-500 mb-1">Prompt original</p>
            <p className="text-sm text-gray-400">{generation.prompt}</p>
          </div>

          {/* Contenido */}
          <div className="space-y-2">
            {editing ? (
              <>
                <Label className="text-gray-400 text-xs">Contenido generado</Label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={20}
                  className="bg-[#1a1a3a] border-purple-900/50 text-gray-200 text-sm leading-relaxed focus-visible:ring-purple-500 font-mono"
                />
              </>
            ) : (
              <div className="prose prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed font-sans bg-transparent p-0 border-0">
                  {content}
                </pre>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-purple-900/20 flex-wrap">
            <div className="flex gap-2">
              {editing ? (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-purple-700 hover:bg-purple-600 text-white"
                    size="sm"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white hover:bg-gray-800"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setEditing(true)}
                  variant="outline"
                  size="sm"
                  className="border-purple-800 text-purple-300 hover:bg-purple-900/30 hover:text-white"
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              )}
            </div>

            {/* Eliminar */}
            {!editing && (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-400">¿Seguro?</span>
                  <Button
                    onClick={handleDelete}
                    disabled={deleting}
                    size="sm"
                    className="bg-red-800 hover:bg-red-700 text-white"
                  >
                    {deleting ? 'Eliminando...' : 'Sí, eliminar'}
                  </Button>
                  <Button
                    onClick={() => setConfirmDelete(false)}
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-white"
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setConfirmDelete(true)}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-400 hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Panel de continuación */}
      <Card className="bg-[#12122a] border-purple-900/40 text-white">
        <CardContent className="pt-5 space-y-3">
          <p className="text-sm font-medium text-purple-200 flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-purple-400" />
            Continuar o elaborar
          </p>
          <p className="text-xs text-gray-500">
            Describe qué quieres desarrollar a partir de lo generado arriba. La IA usará ese contenido como contexto.
          </p>
          <Textarea
            value={continuePrompt}
            onChange={(e) => setContinuePrompt(e.target.value)}
            placeholder="Ej: Amplía su historia de origen, añade un rival, describe su guarida..."
            rows={3}
            className="bg-[#1a1a3a] border-purple-900/50 text-gray-200 text-sm focus-visible:ring-purple-500"
          />
          <Button
            onClick={handleContinue}
            disabled={continuing || !continuePrompt.trim()}
            className="bg-purple-700 hover:bg-purple-600 text-white w-full sm:w-auto"
            size="sm"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            {continuing ? 'Generando...' : 'Generar continuación'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
