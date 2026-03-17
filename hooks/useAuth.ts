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

const PROFILE_CACHE_PREFIX = "commlead_profile_cache:";
const PROFILE_CACHE_TTL_MS = 5 * 60 * 1000;

function getCachedProfile(userId: string): Profile | null {
  try {
    const raw = sessionStorage.getItem(`${PROFILE_CACHE_PREFIX}${userId}`);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as { profile: Profile; cachedAt: number };
    if (!parsed?.profile || !parsed?.cachedAt) return null;

    if (Date.now() - parsed.cachedAt > PROFILE_CACHE_TTL_MS) {
      sessionStorage.removeItem(`${PROFILE_CACHE_PREFIX}${userId}`);
      return null;
    }

    return parsed.profile;
  } catch {
    return null;
  }
}

function setCachedProfile(profile: Profile) {
  try {
    sessionStorage.setItem(
      `${PROFILE_CACHE_PREFIX}${profile.id}`,
      JSON.stringify({ profile, cachedAt: Date.now() })
    );
  } catch {
    // ignore cache write failures
  }
}

function clearProfileCache() {
  try {
    const keys: string[] = [];
    for (let index = 0; index < sessionStorage.length; index += 1) {
      const key = sessionStorage.key(index);
      if (key?.startsWith(PROFILE_CACHE_PREFIX)) {
        keys.push(key);
      }
    }
    keys.forEach((key) => sessionStorage.removeItem(key));
  } catch {
    // ignore cache clear failures
  }
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
        .maybeSingle();

      if (error) {
        // PGRST116 = Row not found, which is expected for new users who haven't set up their profile
        if (error.code === "PGRST116") {
          console.log("Profile not found for user, may need to be created");
          return null;
        }
        console.error("Error fetching profile:", error.message || error.code || JSON.stringify(error));
        return null;
      }

      const profile = data as Profile;
      setCachedProfile(profile);
      return profile;
    } catch (err) {
      // Ignore AbortError - happens during React Strict Mode remounts
      if (err instanceof Error && err.name === 'AbortError') {
        return null;
      }
      console.error("Exception fetching profile:", err);
      return null;
    }
  }, [supabase]);

  const getRoleFromUser = useCallback((user: User): UserRole | null => {
    const rawRole = user.user_metadata?.role || user.app_metadata?.role;
    if (rawRole === "student" || rawRole === "lecturer" || rawRole === "admin" || rawRole === "super_admin") {
      return rawRole as UserRole;
    }
    return null;
  }, []);

  const buildFallbackProfile = useCallback((user: User, role?: UserRole | null): Profile => {
    const resolvedRole = role || getRoleFromUser(user) || "student";
    return {
      id: user.id,
      email: user.email || "",
      full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
      phone: user.user_metadata?.phone || null,
      address: null,
      city: null,
      country: null,
      avatar_url: null,
      role: resolvedRole,
      bio: null,
      specialization: null,
      linkedin_url: null,
      twitter_url: null,
      is_approved: resolvedRole === "admin" || resolvedRole === "super_admin",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }, [getRoleFromUser]);

  useEffect(() => {
    // Prevent multiple initializations
    if (initializingRef.current) return;
    initializingRef.current = true;
    mountedRef.current = true;

    async function initAuth() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        const user = session?.user || null;

        if (error || !user) {
          if (mountedRef.current) {
            setState({ user: null, profile: null, isLoading: false, isAuthenticated: false });
            if (requiredRole) {
              router.push("/auth/login");
            }
          }
          return;
        }

        const cachedProfile = getCachedProfile(user.id);
        if (cachedProfile && mountedRef.current) {
          if (requiredRole) {
            const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
            if (!allowedRoles.includes(cachedProfile.role)) {
              router.push(getRedirectPath(cachedProfile.role));
              return;
            }
          }

          setState({
            user,
            profile: cachedProfile,
            isLoading: false,
            isAuthenticated: true,
          });
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
          const metadataRole = getRoleFromUser(user);

          if (requiredRole && metadataRole) {
            const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
            if (!allowedRoles.includes(metadataRole)) {
              router.push(getRedirectPath(metadataRole));
              return;
            }
          }

          setState({
            user,
            profile: buildFallbackProfile(user, metadataRole),
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
          const cachedProfile = getCachedProfile(session.user.id);
          if (cachedProfile && mountedRef.current) {
            setState({
              user: session.user,
              profile: cachedProfile,
              isLoading: false,
              isAuthenticated: true,
            });
          }

          const profile = await fetchProfile(session.user.id);
          if (mountedRef.current) {
            const fallbackRole = getRoleFromUser(session.user);
            setState({
              user: session.user,
              profile: profile || buildFallbackProfile(session.user, fallbackRole),
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
  }, [supabase, requiredRole, router, fetchProfile, getRoleFromUser, buildFallbackProfile]);

  // Use ref to track sign out in progress to prevent duplicate calls
  const signingOutRef = useRef(false);
  
  const signOut = useCallback(async () => {
    // Prevent multiple sign out attempts
    if (signingOutRef.current || state.isLoading) return;
    signingOutRef.current = true;
    
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await supabase.auth.signOut();
      clearProfileCache();
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
