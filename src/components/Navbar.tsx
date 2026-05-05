'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Scroll, LogOut, BookOpen } from 'lucide-react'

export default function Navbar() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="border-b border-purple-900/30 bg-[#0d0d1a]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <Scroll className="h-6 w-6 text-purple-400 group-hover:text-purple-300 transition-colors" />
          <span className="text-lg font-bold text-purple-200 group-hover:text-white transition-colors tracking-wide">
            NAIrrative
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-gray-400 hover:text-white hover:bg-purple-900/30')}
          >
            <BookOpen className="h-4 w-4 mr-1" />
            Mis historias
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-gray-400 hover:text-white hover:bg-red-900/30"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Salir
          </Button>
        </nav>
      </div>
    </header>
  )
}
