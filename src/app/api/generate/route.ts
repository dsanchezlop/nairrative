import Groq from 'groq-sdk'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { Category } from '@/lib/types'

export const maxDuration = 60

const SYSTEM_PROMPTS: Record<Category, string> = {
  personaje: `Eres un narrador experto en juegos de rol de mesa (D&D, Pathfinder, etc.).
Tu tarea es crear personajes ricos y detallados para partidas de rol.
Para cada personaje incluye: nombre, raza/especie, clase/profesión, trasfondo e historia personal, rasgos de personalidad, ideales, vínculos, defectos, apariencia física, y ganchos narrativos para el dungeon master.
Responde en español, con un estilo narrativo evocador y épico.`,

  historia: `Eres un narrador maestro de juegos de rol de mesa.
Tu tarea es crear historias, aventuras y tramas para partidas de rol.
Incluye: premisa principal, actos de la historia, antagonistas y motivaciones, lugares clave, giros argumentales, y recompensas.
Responde en español con un estilo narrativo inmersivo, épico y cinematográfico.`,

  mundo: `Eres un experto en worldbuilding para juegos de rol de mesa.
Tu tarea es crear y describir elementos del mundo: reinos, ciudades, regiones, organizaciones, religiones, historia del mundo, razas, etc.
Incluye detalles sobre geografía, cultura, política, economía y secretos del lugar.
Responde en español con un estilo descriptivo y evocador.`,

  encuentro: `Eres un diseñador de encuentros para juegos de rol de mesa.
Tu tarea es crear encuentros equilibrados y emocionantes: combates, encuentros sociales, acertijos o retos de exploración.
Incluye: descripción de la escena, participantes o enemigos, objetivos, posibles desarrollos, y consejos para el dungeon master.
Responde en español con claridad y detalle táctico.`,

  otro: `Eres un asistente creativo experto en juegos de rol de mesa.
Ayuda con cualquier elemento de rol: objetos mágicos, hechizos, misiones secundarias, tabernas, NPCs, rumores, mapas narrativos, etc.
Responde en español con creatividad, detalle y un tono épico y evocador.`,
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Parsear el cuerpo de la petición
    let body: { prompt?: string; category?: Category; parentContent?: string; returnOnly?: boolean; campaign_id?: string | null }
    try {
      body = await request.json()
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr)
      return NextResponse.json({ error: 'Cuerpo de petición inválido' }, { status: 400 })
    }
    const { prompt, category, parentContent, returnOnly, campaign_id, game_system } = body as { prompt: string; category: Category; parentContent?: string; returnOnly?: boolean; campaign_id?: string | null; game_system?: string | null }

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json({ error: 'El prompt no puede estar vacío' }, { status: 400 })
    }

    if (!category || !['personaje', 'historia', 'mundo', 'encuentro', 'otro'].includes(category)) {
      return NextResponse.json({ error: 'Categoría no válida' }, { status: 400 })
    }

    // Llamar a Groq (si llegamos al límite de tokens, cambiamos a llama)
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    const MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant']

    let content: string | null = null
    for (const model of MODELS) {
      try {
        const baseSystemPrompt = SYSTEM_PROMPTS[category]
        const systemContent = game_system
          ? `Sistema de juego de rol: ${game_system}\n\nTen en cuenta las reglas, ambientación, terminología y convenciones propias de ${game_system} al generar el contenido.\n\n${baseSystemPrompt}`
          : baseSystemPrompt

        const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
          { role: 'system', content: systemContent },
        ]
        if (parentContent) {
          messages.push({ role: 'assistant', content: parentContent })
          messages.push({ role: 'user', content: `Continúa o elabora sobre lo anterior siguiendo esta indicación: ${prompt.trim()}` })
        } else {
          messages.push({ role: 'user', content: prompt.trim() })
        }
        const completion = await groq.chat.completions.create({
          model,
          messages,
          temperature: 0.9,
          max_tokens: 2048,
        })
        content = completion.choices[0]?.message?.content ?? ''
        break
      } catch (groqErr) {
        const msg = (groqErr as Error).message ?? ''
        const isRateLimit = msg.includes('429') || msg.includes('quota') || msg.includes('rate')
        if (isRateLimit && model !== MODELS[MODELS.length - 1]) {
          console.warn(`Rate limit en ${model}, intentando con fallback...`)
          continue
        }
        console.error('Groq error:', msg)
        if (isRateLimit) {
          return NextResponse.json({ error: 'Límite de la IA alcanzado. Espera un momento e inténtalo de nuevo.' }, { status: 429 })
        }
        throw groqErr
      }
    }

    if (!content) {
      return NextResponse.json({ error: 'No se pudo generar contenido.' }, { status: 500 })
    }

    
    if (returnOnly) {
      return NextResponse.json({ content })
    }

    // Generar título automático (primeras palabras del prompt)
    const autoTitle = prompt.trim().slice(0, 60) + (prompt.trim().length > 60 ? '...' : '')

    // Guardar en Supabase
    const { data, error: dbError } = await supabase
      .from('generations')
      .insert({
        user_id: user.id,
        title: autoTitle,
        prompt: prompt.trim(),
        content,
        category,
        campaign_id: campaign_id ?? null,
      })
      .select()
      .single()

    if (dbError) {
      console.error('DB error:', dbError)
      return NextResponse.json({ error: 'Error al guardar la generación' }, { status: 500 })
    }

    return NextResponse.json({ generation: data })
  } catch (err) {
    console.error('Generate error (full):', JSON.stringify(err, Object.getOwnPropertyNames(err as object)))
    console.error('Generate error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
