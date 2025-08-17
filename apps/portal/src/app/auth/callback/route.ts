import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  
  if (code) {
    const supabase = createClient();
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      // Check if user is authorized
      const isAuthorized = await checkUserAuthorization(data.user.email);
      
      if (!isAuthorized) {
        // User is not authorized - sign them out and redirect to unauthorized page
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/unauthorized`);
      }
      
      // User is authorized - redirect to dashboard
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // Something went wrong - redirect to login
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}

// Check if user email is in the authorized list
async function checkUserAuthorization(email: string | undefined): Promise<boolean> {
  if (!email) return false;
  
  // TODO: You can replace this with a database check or environment variable
  // For now, using a hardcoded list of authorized emails
  const authorizedEmails = [
    // Add your email and your business partner's email here
    'your-email@gmail.com',
    'partner-email@gmail.com',
    // You can also use environment variables:
    process.env.ADMIN_EMAIL_1,
    process.env.ADMIN_EMAIL_2,
  ].filter(Boolean); // Remove any undefined values
  
  return authorizedEmails.includes(email.toLowerCase());
}
