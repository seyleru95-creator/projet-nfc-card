import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const AUTH_QUERY_KEY = ["auth", "user"] as const;

type AuthUser = {
  id: string;
  email: string | null;
};

async function fetchAuthUser(): Promise<AuthUser | null> {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) return null;

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return null;

  return {
    id: userData.user.id,
    email: userData.user.email ?? null,
  };
}

export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: user,
    isPending,
    error,
  } = useQuery<AuthUser | null, Error>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: fetchAuthUser,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      queryClient.setQueryData<AuthUser | null>(AUTH_QUERY_KEY, (prev) => {
        if (!session) return null;
        return {
          id: session.user.id,
          email: session.user.email ?? null,
        };
      });

      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, [queryClient]);

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) throw loginError;
    },
    onSuccess: async () => {
      const fresh = await fetchAuthUser();
      queryClient.setQueryData(AUTH_QUERY_KEY, fresh);
      navigate({ to: "/admin" });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await supabase.auth.signOut();
    },
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      queryClient.removeQueries({ queryKey: ["profile"] });
      queryClient.removeQueries({ queryKey: ["gallery"] });
      navigate({ to: "/auth" });
    },
  });

  const userId = user?.id ?? null;

  async function handleLogin(email: string, password: string) {
    try {
      await loginMutation.mutateAsync({ email, password });
    } catch {
      throw new Error("Identifiants incorrects. Veuillez reessayer.");
    }
  }

  async function handleLogout() {
    await logoutMutation.mutateAsync();
  }

  return {
    userId,
    loading: isPending,
    error: loginMutation.isError
      ? "Identifiants incorrects. Veuillez reessayer."
      : (error?.message ?? null),
    handleLogin,
    handleLogout,
  };
}
