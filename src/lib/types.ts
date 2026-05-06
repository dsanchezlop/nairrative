export type Category = 'personaje' | 'historia' | 'mundo' | 'encuentro' | 'otro'

export const RPG_SYSTEMS = [
  'Dungeons & Dragons 3.5e',
  'Dungeons & Dragons 5e',
  'Pathfinder 1e',
  'Pathfinder 2e',
  'Starfinder',
  'Call of Cthulhu 7e',
  'Warhammer Fantasy 4e',
  'Vampiro: La Mascarada 5e',
  'Star Wars FFG',
  'Shadowrun 6e',
  'Cyberpunk RED',
  'Sistema propio / Homebrew',
  'Otro',
] as const

export interface Campaign {
  id: string
  user_id: string
  name: string
  game_system: string
  created_at: string
}

export interface Generation {
  id: string
  user_id: string
  title: string
  prompt: string
  content: string
  category: Category
  campaign_id: string | null
  image_url?: string | null
  created_at: string
  updated_at: string
}
