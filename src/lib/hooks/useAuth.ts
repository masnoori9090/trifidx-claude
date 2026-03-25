"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User as AppUser } from "@/lib/types";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAppUser = async (uid: string) => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", uid)
        .single();
      setAppUser(data ?? null);
    } catch {
      setAppUser(null);
    }
  };

  useEffect(() => {
    const supabase = createClient();

    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setAuthUser(user);
        if (user) await fetchAppUser(user.id);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setAuthUser(session?.user ?? null);
        if (session?.user) {
          await fetchAppUser(session.user.id);
        } else {
          setAppUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { authUser, appUser, loading };
}
