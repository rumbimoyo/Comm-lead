"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/utils/supabase-browser";
import type { Profile, UserRole } from "@/types/database";
import type { User, AuthChangeEvent, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth(requiredRole?: UserRole | UserRole[]) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const router = useRouter();
  // Use the singleton client directly - NO useMemo needed since it's already a singleton
  const supabase = supabaseBrowser;
  
  // Track if component is mounted to prevent state updates after unmount
  const mountedRef = useRef(true);
  // Track if auth is initializing to prevent race conditions
  const initializingRef = useRef(false);

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        // PGRST116 = Row not found, which is expected for new users who haven't set up their profile
        if (error.code === "PGRST116") {
          console.log("Profile not found for user, may need to be created");
          return null;
        }
        console.error("Error fetching profile:", error.message || error.code || JSON.stringify(error));
        return null;
      }

      return data as Profile;
    } catch (err) {
      // Ignore AbortError - happens during React Strict Mode remounts
      if (err instanceof Error && err.name === 'AbortError') {
        return null;
      }
      console.error("Exception fetching profile:", err);
      return null;
    }
  }, [supabase]);

  useEffect(() => {
    // Prevent multiple initializations
    if (initializingRef.current) return;
    initializingRef.current = true;
    mountedRef.current = true;

    async function initAuth() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
          if (mountedRef.current) {
            setState({ user: null, profile: null, isLoading: false, isAuthenticated: false });
            if (requiredRole) {
              router.push("/auth/login");
            }
          }
          return;
        }

        const profile = await fetchProfile(user.id);

        if (!mountedRef.current) return;

        if (profile) {
          // Check role requirement
          if (requiredRole) {
            const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
            
            if (!allowedRoles.includes(profile.role)) {
              // Redirect based on actual role
              const redirectPath = getRedirectPath(profile.role);
              router.push(redirectPath);
              return;
            }
          }

          setState({
            user,
            profile,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setState({
            user,
            profile: null,
            isLoading: false,
            isAuthenticated: true,
          });
        }
      } catch (error) {
        // Ignore AbortError - this happens during React Strict Mode remounts
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        console.error("Auth error:", error);
        if (mountedRef.current) {
          setState({ user: null, profile: null, isLoading: false, isAuthenticated: false });
        }
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        // Ignore events while unmounted
        if (!mountedRef.current) return;
        
        if (event === "SIGNED_OUT") {
          setState({ user: null, profile: null, isLoading: false, isAuthenticated: false });
          // Don't redirect here - let signOut function handle it
        } else if (event === "SIGNED_IN" && session?.user) {
          const profile = await fetchProfile(session.user.id);
          if (mountedRef.current) {
            setState({
              user: session.user,
              profile,
              isLoading: false,
              isAuthenticated: true,
            });
          }
        } else if (event === "TOKEN_REFRESHED" && session?.user) {
          // Silently refresh profile on token refresh
          if (mountedRef.current && state.profile) {
            const profile = await fetchProfile(session.user.id);
            if (mountedRef.current && profile) {
              setState(prev => ({ ...prev, profile }));
            }
          }
        }
      }
    );

    return () => {
      mountedRef.current = false;
      initializingRef.current = false;
      subscription.unsubscribe();
    };
  }, [supabase, requiredRole, router, fetchProfile]);

  // Use ref to track sign out in progress to prevent duplicate calls
  const signingOutRef = useRef(false);
  
  const signOut = useCallback(async () => {
    // Prevent multiple sign out attempts
    if (signingOutRef.current || state.isLoading) return;
    signingOutRef.current = true;
    
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
    
    // Use window.location for full page reload to clear all state
    window.location.href = "/auth/login";
  }, [supabase, state.isLoading]);

  const refreshProfile = async () => {
    if (state.user) {
      const profile = await fetchProfile(state.user.id);
      setState(prev => ({ ...prev, profile }));
    }
  };

  return {
    ...state,
    signOut,
    refreshProfile,
    supabase,
  };
}

function getRedirectPath(role: UserRole): string {
  switch (role) {
    case "admin":
    case "super_admin":
      return "/admin";
    case "lecturer":
      return "/lecturer";
    case "student":
    default:
      return "/dashboard";
  }
}
