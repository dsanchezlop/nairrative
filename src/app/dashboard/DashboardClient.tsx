'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import GenerationForm from '@/components/GenerationForm'
import GenerationList from '@/components/GenerationList'
import { createClient } from '@/lib/supabase/client'
import type { Campaign } from '@/lib/types'
import { Swords } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export default function DashboardClient({ initialCampaigns }: { initialCampaigns: Campaign[] }) {
  const searchParams = useSearchParams()
  const [refreshKey, setRefreshKey] = useState(0)
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns)
  const [activeCampaign, setActiveCampaign] = useState<string | null>(
    searchParams.get('campaign')
  )

  useEffect(() => {
    const supabase = createClient()
    supabase.from('campaigns').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setCampaigns(data) })
  }, [refreshKey])

  const activeCampaignData = campaigns.find((c) => c.id === activeCampaign)

  return (
    <div className="space-y-6">
      {/* Selector de campaña */}
      {campaigns.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-400 flex items-center gap-1">
            <Swords className="h-4 w-4" /> Campaña:
          </span>
          <button
            onClick={() => setActiveCampaign(null)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border ${
              activeCampaign === null
                ? 'bg-purple-700 text-white border-purple-500'
                : 'bg-[#1a1a3a] text-gray-400 border-purple-900/30 hover:border-purple-600 hover:text-gray-200'
            }`}
          >
            Todas
          </button>
          {campaigns.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCampaign(c.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border ${
                activeCampaign === c.id
                  ? 'bg-purple-700 text-white border-purple-500'
                  : 'bg-[#1a1a3a] text-gray-400 border-purple-900/30 hover:border-purple-600 hover:text-gray-200'
              }`}
            >
              {c.name}
              {c.game_system && <span className="text-xs opacity-60 ml-1">({c.game_system})</span>}
            </button>
          ))}
          <Link
            href="/campaigns"
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-gray-500 hover:text-purple-300 text-xs')}
          >
            Gestionar
          </Link>
        </div>
      )}

      {campaigns.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Swords className="h-4 w-4" />
          <span>¿Tienes una campaña?</span>
          <Link href="/campaigns" className="text-purple-400 hover:text-purple-300 underline">
            Crea una aquí
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Columna izquierda: formulario */}
        <div>
          <GenerationForm onGenerated={() => setRefreshKey((k) => k + 1)} defaultCampaignId={activeCampaign} />
        </div>

        {/* Columna derecha: historial */}
        <div>
          <h2 className="text-lg font-semibold text-purple-200 mb-4">
            Historial
            {activeCampaignData && (
              <span className="text-sm font-normal text-gray-400 ml-2">— {activeCampaignData.name}</span>
            )}
          </h2>
          <GenerationList refreshKey={refreshKey} campaignId={activeCampaign} />
        </div>
      </div>
    </div>
  )
}
