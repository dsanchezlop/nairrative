import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Scroll, Wand2, BookOpen, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const FEATURES = [
  {
    icon: Wand2,
    title: 'Generación con IA',
    description: 'Crea personajes, historias, mundos y encuentros al instante con Groq y Llama.',
  },
  {
    icon: BookOpen,
    title: 'Historial de textos',
    description: 'Todos tus textos guardados en un solo lugar, filtrados por categoría.',
  },
  {
    icon: Users,
    title: 'Cuentas personales',
    description: 'Tus historias son privadas. Solo tú puedes verlas y editarlas.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-purple-900/30 px-6 h-16 flex items-center justify-between max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <Scroll className="h-6 w-6 text-purple-400" />
          <span className="text-lg font-bold text-purple-200 tracking-wide">NAIrrative</span>
        </div>
        <nav className="flex gap-2">
          <Link href="/login" className={cn(buttonVariants({ variant: 'ghost' }), 'text-gray-400 hover:text-white hover:bg-purple-900/30')}>
            Iniciar sesión
          </Link>
          <Link href="/register" className={cn(buttonVariants(), 'bg-purple-700 hover:bg-purple-600 text-white')}>
            Crear cuenta
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 max-w-3xl mx-auto w-full">
        <div className="mb-6 inline-flex items-center gap-2 bg-purple-900/30 border border-purple-800/50 rounded-full px-4 py-1.5 text-sm text-purple-300">
          <Wand2 className="h-3.5 w-3.5" />
          Impulsado por Groq · Llama 3.3
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
          <span className="text-white">Tu asistente de </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            rol con IA
          </span>
        </h1>

        <p className="text-lg text-gray-400 mb-10 max-w-xl">
          Genera personajes épicos, historias inmersivas, mundos detallados y encuentros emocionantes
          para tus partidas de rol en segundos.
        </p>

        <div className="flex gap-4 flex-wrap justify-center">
          <Link href="/register" className={cn(buttonVariants({ size: 'lg' }), 'bg-purple-700 hover:bg-purple-600 text-white font-semibold px-8')}>
            Empezar gratis
          </Link>
          <Link href="/login" className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), 'border-purple-800 text-purple-300 hover:bg-purple-900/30 hover:text-white px-8')}>
            Ya tengo cuenta
          </Link>
        </div>
      </main>

      {/* Features */}
      <section className="max-w-5xl mx-auto w-full px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-[#12122a] border border-purple-900/30 rounded-xl p-6 space-y-3">
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-purple-900/40">
                <f.icon className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="font-semibold text-purple-100">{f.title}</h3>
              <p className="text-sm text-gray-400">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-purple-900/20 py-4 text-center text-xs text-gray-600">
        NAIrrative — Proyecto universitario
      </footer>
    </div>
  )
}

