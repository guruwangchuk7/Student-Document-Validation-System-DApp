import { cookies } from "next/headers";
import UniversityDashboard from "./_components/UniversityDashboard";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

/**
 * UNIVERSITY ADMIN PAGE (Server Component)
 *
 * Performance Optimized:
 * 1. Fetches session on the server to prevent client-side "auth-hanging"
 * 2. Provides immediate state to the client component, eliminating the loading wait
 */
export default async function UniversityAdminPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return <UniversityDashboard initialUser={session?.user ? JSON.parse(JSON.stringify(session.user)) : null} />;
}
