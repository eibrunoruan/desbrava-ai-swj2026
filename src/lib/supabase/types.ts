export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          password_hash: string;
          photo_url: string | null;
          job_role: string | null;
          area: string | null;
          experience_years: number | null;
          education_level: string | null;
          education_course: string | null;
          education_institution: string | null;
          languages: Json | null;
          target_role: string | null;
          target_timeline: string | null;
          motivation: string | null;
          cv_url: string | null;
          cv_extracted_data: Json | null;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          password_hash?: string;
          photo_url?: string | null;
          job_role?: string | null;
          area?: string | null;
          experience_years?: number | null;
          education_level?: string | null;
          education_course?: string | null;
          education_institution?: string | null;
          languages?: Json | null;
          target_role?: string | null;
          target_timeline?: string | null;
          motivation?: string | null;
          cv_url?: string | null;
          cv_extracted_data?: Json | null;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          password_hash?: string;
          photo_url?: string | null;
          job_role?: string | null;
          area?: string | null;
          experience_years?: number | null;
          education_level?: string | null;
          education_course?: string | null;
          education_institution?: string | null;
          languages?: Json | null;
          target_role?: string | null;
          target_timeline?: string | null;
          motivation?: string | null;
          cv_url?: string | null;
          cv_extracted_data?: Json | null;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      assessments: {
        Row: {
          id: string;
          user_id: string;
          type: "mbti" | "big_five" | "disc" | "ikigai" | "flow";
          status: "pending" | "in_progress" | "completed";
          responses: Json | null;
          results: Json | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "mbti" | "big_five" | "disc" | "ikigai" | "flow";
          status?: "pending" | "in_progress" | "completed";
          responses?: Json | null;
          results?: Json | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: "mbti" | "big_five" | "disc" | "ikigai" | "flow";
          status?: "pending" | "in_progress" | "completed";
          responses?: Json | null;
          results?: Json | null;
          created_at?: string;
          completed_at?: string | null;
        };
      };
      consolidated_profiles: {
        Row: {
          id: string;
          user_id: string;
          personality_map: Json | null;
          purpose: Json | null;
          flow_zone: Json | null;
          gap_analysis: Json | null;
          readiness_score: number | null;
          insights: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          personality_map?: Json | null;
          purpose?: Json | null;
          flow_zone?: Json | null;
          gap_analysis?: Json | null;
          readiness_score?: number | null;
          insights?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          personality_map?: Json | null;
          purpose?: Json | null;
          flow_zone?: Json | null;
          gap_analysis?: Json | null;
          readiness_score?: number | null;
          insights?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      pdis: {
        Row: {
          id: string;
          user_id: string;
          type: "generated" | "imported";
          status: "draft" | "active" | "completed";
          modules: Json | null;
          source_file_url: string | null;
          ai_suggestions: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "generated" | "imported";
          status?: "draft" | "active" | "completed";
          modules?: Json | null;
          source_file_url?: string | null;
          ai_suggestions?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: "generated" | "imported";
          status?: "draft" | "active" | "completed";
          modules?: Json | null;
          source_file_url?: string | null;
          ai_suggestions?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      pdi_items: {
        Row: {
          id: string;
          pdi_id: string;
          module: "foundation" | "specialization" | "consolidation";
          title: string;
          description: string | null;
          type: "course" | "project" | "reading" | "exercise";
          flow_potential: "high" | "medium" | "low";
          flow_strategy: string | null;
          status: "pending" | "in_progress" | "completed";
          due_date: string | null;
          completed_at: string | null;
          order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          pdi_id: string;
          module: "foundation" | "specialization" | "consolidation";
          title: string;
          description?: string | null;
          type: "course" | "project" | "reading" | "exercise";
          flow_potential?: "high" | "medium" | "low";
          flow_strategy?: string | null;
          status?: "pending" | "in_progress" | "completed";
          due_date?: string | null;
          completed_at?: string | null;
          order: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          pdi_id?: string;
          module?: "foundation" | "specialization" | "consolidation";
          title?: string;
          description?: string | null;
          type?: "course" | "project" | "reading" | "exercise";
          flow_potential?: "high" | "medium" | "low";
          flow_strategy?: string | null;
          status?: "pending" | "in_progress" | "completed";
          due_date?: string | null;
          completed_at?: string | null;
          order?: number;
          created_at?: string;
        };
      };
      course_recommendations: {
        Row: {
          id: string;
          pdi_item_id: string;
          user_id: string;
          title: string;
          url: string | null;
          platform: string | null;
          rating: number | null;
          students_count: number | null;
          price: number | null;
          duration: string | null;
          language: string | null;
          compatibility_score: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          pdi_item_id: string;
          user_id: string;
          title: string;
          url?: string | null;
          platform?: string | null;
          rating?: number | null;
          students_count?: number | null;
          price?: number | null;
          duration?: string | null;
          language?: string | null;
          compatibility_score?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          pdi_item_id?: string;
          user_id?: string;
          title?: string;
          url?: string | null;
          platform?: string | null;
          rating?: number | null;
          students_count?: number | null;
          price?: number | null;
          duration?: string | null;
          language?: string | null;
          compatibility_score?: number | null;
          created_at?: string;
        };
      };
      checkins: {
        Row: {
          id: string;
          user_id: string;
          pdi_id: string;
          feeling: string | null;
          flow_updates: Json | null;
          goal_changed: boolean | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          pdi_id: string;
          feeling?: string | null;
          flow_updates?: Json | null;
          goal_changed?: boolean | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          pdi_id?: string;
          feeling?: string | null;
          flow_updates?: Json | null;
          goal_changed?: boolean | null;
          notes?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
