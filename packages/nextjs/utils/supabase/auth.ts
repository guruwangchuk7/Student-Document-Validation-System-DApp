import { createBrowserClient } from "@supabase/auth-helpers-nextjs";

// Initialize Browser Client with Session-based storage (logs out when tab/browser closes)
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      storageKey: "sb-university-session",
      storage: typeof window !== "undefined" ? window.sessionStorage : undefined,
    },
  },
);

export const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: typeof window !== "undefined" ? `${window.location.origin}/university` : "",
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });
  if (error) console.error("Error signing in with Google:", error.message);
};

export const logout = async () => {
  await supabase.auth.signOut();
  window.location.href = "/";
};
