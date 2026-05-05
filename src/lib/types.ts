export type Category = 'personaje' | 'historia' | 'mundo' | 'encuentro' | 'otro'

export interface Generation {
  id: string
  user_id: string
  title: string
  prompt: string
  content: string
  category: Category
  created_at: string
  updated_at: string
}
