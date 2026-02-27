// app/auth/callback/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/app/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Erfolgreich eingeloggt -> ab zum Dashboard!
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Falls etwas schiefgeht, zurück zum Login
  return NextResponse.redirect(`${origin}/login?error=auth-failed`);
}