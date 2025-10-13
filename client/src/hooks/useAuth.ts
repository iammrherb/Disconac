// Replit Auth integration hook
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const res = await fetch("/api/auth/user", {
        credentials: "include",
      });
      
      // Return null for 401 (unauthenticated) instead of throwing
      if (res.status === 401) {
        return null;
      }
      
      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }
      
      return await res.json();
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes - don't refetch constantly
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: false, // Don't refetch on reconnect
    refetchInterval: false, // No automatic refetching
    gcTime: 10 * 60 * 1000, // Keep cache for 10 minutes even if unused
  });

  return {
    user: user ?? undefined,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}
