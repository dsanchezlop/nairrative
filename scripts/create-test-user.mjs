import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xusvqfezwzyesiycrboa.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1c3ZxZmV6d3p5ZXNpeWNyYm9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NzA0NDEsImV4cCI6MjA5MzU0NjQ0MX0.mziwG0x2uey7lzNsqWahlbrrmELHJiu9KWoWpx9EJMs'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const { data, error } = await supabase.auth.signUp({
  email: 'testuser@example.com',
  password: 'prueba1234',
})

if (error) {
  console.error('Error:', error.message)
} else {
  console.log('✓ Usuario creado correctamente')
  console.log('  Email:      testuser@example.com')
  console.log('  Contraseña: prueba1234')
  if (data.user?.identities?.length === 0) {
    console.log('\n⚠ El usuario ya existía previamente.')
  }
  if (data.session === null) {
    console.log('\n⚠ Confirma el email antes de hacer login (o desactiva "Confirm email" en Supabase).')
    console.log('  Supabase → Authentication → Providers → Email → desactiva "Confirm email"')
  }
}
