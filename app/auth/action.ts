'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

import { createClient } from '@/app/supabase-server'

export async function emailLogin(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/auth?message=Invalid email or password')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function emailSignup(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }
  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/auth?message=Invalid email or password')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function logOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  // Clear cookies by setting them to expire
  const cookieStore = await cookies()
  cookieStore.delete('sb-ynsflrhfvjmliaiuhmox-auth-token.0')
  cookieStore.delete('sb-ynsflrhfvjmliaiuhmox-auth-token.1')

  
  revalidatePath('/', 'layout')
  redirect('/auth')
}
