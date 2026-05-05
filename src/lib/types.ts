export type Category = 'personaje' | 'historia' | 'mundo' | 'encuentro' | 'otro'

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
  created_at: string
  updated_at: string
}
