import { create } from "zustand";

export interface AppUser {
  id: string;
  email: string;
  name: string;
  photo_url: string | null;
  job_role: string | null;
  area: string | null;
  experience_years: number | null;
  education_level: string | null;
  education_course: string | null;
  education_institution: string | null;
  languages: unknown;
  target_role: string | null;
  target_timeline: string | null;
  motivation: string | null;
  cv_url: string | null;
  cv_extracted_data: unknown;
  onboarding_completed: boolean;
  plan: string;
  created_at: string;
  updated_at: string;
}

interface UserState {
  user: AppUser | null;
  loading: boolean;
  setUser: (user: AppUser) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  loadFromStorage: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("destrava_user", JSON.stringify(user));
    }
    set({ user, loading: false });
  },
  clearUser: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("destrava_user");
    }
    set({ user: null, loading: false });
  },
  setLoading: (loading) => set({ loading }),
  loadFromStorage: () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("destrava_user");
      if (stored) {
        try {
          const user = JSON.parse(stored) as AppUser;
          set({ user, loading: false });
          return;
        } catch {
          localStorage.removeItem("destrava_user");
        }
      }
    }
    set({ loading: false });
  },
}));
