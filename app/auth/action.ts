'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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
  redirect('/auth')
}