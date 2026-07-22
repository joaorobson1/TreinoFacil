export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          criteria: Database["public"]["Enums"]["achievement_criteria"]
          description: string | null
          icon: string | null
          id: number
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          threshold: number
          tier: number
        }
        Insert: {
          criteria: Database["public"]["Enums"]["achievement_criteria"]
          description?: string | null
          icon?: string | null
          id?: never
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          threshold?: number
          tier?: number
        }
        Update: {
          criteria?: Database["public"]["Enums"]["achievement_criteria"]
          description?: string | null
          icon?: string | null
          id?: never
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          threshold?: number
          tier?: number
        }
        Relationships: []
      }
      app_events: {
        Row: {
          created_at: string
          id: number
          payload: Json
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: never
          payload?: Json
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: never
          payload?: Json
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      body_measurements: {
        Row: {
          arm_cm: number | null
          bmi: number | null
          body_fat_pct: number | null
          chest_cm: number | null
          created_at: string
          height_cm: number | null
          hip_cm: number | null
          id: string
          measured_at: string
          notes: string | null
          thigh_cm: number | null
          user_id: string
          waist_cm: number | null
          weight_kg: number | null
        }
        Insert: {
          arm_cm?: number | null
          bmi?: number | null
          body_fat_pct?: number | null
          chest_cm?: number | null
          created_at?: string
          height_cm?: number | null
          hip_cm?: number | null
          id?: string
          measured_at?: string
          notes?: string | null
          thigh_cm?: number | null
          user_id: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Update: {
          arm_cm?: number | null
          bmi?: number | null
          body_fat_pct?: number | null
          chest_cm?: number | null
          created_at?: string
          height_cm?: number | null
          hip_cm?: number | null
          id?: string
          measured_at?: string
          notes?: string | null
          thigh_cm?: number | null
          user_id?: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "body_measurements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      completed_workouts: {
        Row: {
          completed_at: string
          created_at: string
          duration_seconds: number | null
          id: string
          notes: string | null
          started_at: string | null
          total_volume: number | null
          user_id: string
          user_workout_id: string
          workout_day_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          notes?: string | null
          started_at?: string | null
          total_volume?: number | null
          user_id: string
          user_workout_id: string
          workout_day_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          notes?: string | null
          started_at?: string | null
          total_volume?: number | null
          user_id?: string
          user_workout_id?: string
          workout_day_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "completed_workouts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "completed_workouts_user_workout_id_fkey"
            columns: ["user_workout_id"]
            isOneToOne: false
            referencedRelation: "user_workouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "completed_workouts_workout_day_id_fkey"
            columns: ["workout_day_id"]
            isOneToOne: false
            referencedRelation: "workout_days"
            referencedColumns: ["id"]
          },
        ]
      }
      equipments: {
        Row: {
          category: string | null
          description: string | null
          id: number
          name: string
          slug: string
        }
        Insert: {
          category?: string | null
          description?: string | null
          id?: never
          name: string
          slug: string
        }
        Update: {
          category?: string | null
          description?: string | null
          id?: never
          name?: string
          slug?: string
        }
        Relationships: []
      }
      exercise_categories: {
        Row: {
          description: string | null
          id: number
          name: string
          slug: string
        }
        Insert: {
          description?: string | null
          id?: never
          name: string
          slug: string
        }
        Update: {
          description?: string | null
          id?: never
          name?: string
          slug?: string
        }
        Relationships: []
      }
      exercise_equipments: {
        Row: {
          equipment_id: number
          exercise_id: string
          is_required: boolean
        }
        Insert: {
          equipment_id: number
          exercise_id: string
          is_required?: boolean
        }
        Update: {
          equipment_id?: number
          exercise_id?: string
          is_required?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "exercise_equipments_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_equipments_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_limitations: {
        Row: {
          exercise_id: string
          limitation_id: number
          restriction: Database["public"]["Enums"]["restriction_level"]
        }
        Insert: {
          exercise_id: string
          limitation_id: number
          restriction?: Database["public"]["Enums"]["restriction_level"]
        }
        Update: {
          exercise_id?: string
          limitation_id?: number
          restriction?: Database["public"]["Enums"]["restriction_level"]
        }
        Relationships: [
          {
            foreignKeyName: "exercise_limitations_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_limitations_limitation_id_fkey"
            columns: ["limitation_id"]
            isOneToOne: false
            referencedRelation: "limitations"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_media: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          is_primary: boolean
          position: number
          storage_path: string | null
          type: Database["public"]["Enums"]["media_type"]
          url: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          is_primary?: boolean
          position?: number
          storage_path?: string | null
          type: Database["public"]["Enums"]["media_type"]
          url: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          is_primary?: boolean
          position?: number
          storage_path?: string | null
          type?: Database["public"]["Enums"]["media_type"]
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_media_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_muscle_groups: {
        Row: {
          exercise_id: string
          muscle_group_id: number
          role: Database["public"]["Enums"]["muscle_role"]
        }
        Insert: {
          exercise_id: string
          muscle_group_id: number
          role?: Database["public"]["Enums"]["muscle_role"]
        }
        Update: {
          exercise_id?: string
          muscle_group_id?: number
          role?: Database["public"]["Enums"]["muscle_role"]
        }
        Relationships: [
          {
            foreignKeyName: "exercise_muscle_groups_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_muscle_groups_muscle_group_id_fkey"
            columns: ["muscle_group_id"]
            isOneToOne: false
            referencedRelation: "muscle_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_progress: {
        Row: {
          best_e1rm: number | null
          completed_workout_id: string | null
          created_at: string
          exercise_id: string
          id: string
          performed_on: string
          top_weight_kg: number | null
          total_reps: number | null
          total_sets: number | null
          total_volume: number | null
          user_id: string
        }
        Insert: {
          best_e1rm?: number | null
          completed_workout_id?: string | null
          created_at?: string
          exercise_id: string
          id?: string
          performed_on: string
          top_weight_kg?: number | null
          total_reps?: number | null
          total_sets?: number | null
          total_volume?: number | null
          user_id: string
        }
        Update: {
          best_e1rm?: number | null
          completed_workout_id?: string | null
          created_at?: string
          exercise_id?: string
          id?: string
          performed_on?: string
          top_weight_kg?: number | null
          total_reps?: number | null
          total_sets?: number | null
          total_volume?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_progress_completed_workout_id_fkey"
            columns: ["completed_workout_id"]
            isOneToOne: false
            referencedRelation: "completed_workouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_progress_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          breathing: string | null
          category_id: number | null
          common_mistakes: string | null
          created_at: string
          description: string | null
          equipment_id: number | null
          execution: string | null
          id: string
          is_active: boolean
          level: Database["public"]["Enums"]["exercise_level"]
          name: string
          primary_muscle_group_id: number | null
          slug: string
          tips: string | null
          updated_at: string
        }
        Insert: {
          breathing?: string | null
          category_id?: number | null
          common_mistakes?: string | null
          created_at?: string
          description?: string | null
          equipment_id?: number | null
          execution?: string | null
          id?: string
          is_active?: boolean
          level?: Database["public"]["Enums"]["exercise_level"]
          name: string
          primary_muscle_group_id?: number | null
          slug: string
          tips?: string | null
          updated_at?: string
        }
        Update: {
          breathing?: string | null
          category_id?: number | null
          common_mistakes?: string | null
          created_at?: string
          description?: string | null
          equipment_id?: number | null
          execution?: string | null
          id?: string
          is_active?: boolean
          level?: Database["public"]["Enums"]["exercise_level"]
          name?: string
          primary_muscle_group_id?: number | null
          slug?: string
          tips?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercises_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "exercise_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_primary_muscle_group_id_fkey"
            columns: ["primary_muscle_group_id"]
            isOneToOne: false
            referencedRelation: "muscle_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          description: string | null
          icon: string | null
          id: number
          is_active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          description?: string | null
          icon?: string | null
          id?: never
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          description?: string | null
          icon?: string | null
          id?: never
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      limitations: {
        Row: {
          category: string | null
          description: string | null
          id: number
          is_active: boolean
          name: string
          slug: string
        }
        Insert: {
          category?: string | null
          description?: string | null
          id?: never
          is_active?: boolean
          name: string
          slug: string
        }
        Update: {
          category?: string | null
          description?: string | null
          id?: never
          is_active?: boolean
          name?: string
          slug?: string
        }
        Relationships: []
      }
      muscle_groups: {
        Row: {
          created_at: string
          id: number
          name: string
          parent_id: number | null
          slug: string
        }
        Insert: {
          created_at?: string
          id?: never
          name: string
          parent_id?: number | null
          slug: string
        }
        Update: {
          created_at?: string
          id?: never
          name?: string
          parent_id?: number | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "muscle_groups_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "muscle_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          available_days: number | null
          available_time_minutes: number | null
          created_at: string
          experience: Database["public"]["Enums"]["experience_level"] | null
          goal_id: number | null
          height_cm: number | null
          id: string
          onboarding_completed: boolean
          sex: Database["public"]["Enums"]["sex_type"] | null
          training_location:
            | Database["public"]["Enums"]["training_location"]
            | null
          updated_at: string
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          age?: number | null
          available_days?: number | null
          available_time_minutes?: number | null
          created_at?: string
          experience?: Database["public"]["Enums"]["experience_level"] | null
          goal_id?: number | null
          height_cm?: number | null
          id?: string
          onboarding_completed?: boolean
          sex?: Database["public"]["Enums"]["sex_type"] | null
          training_location?:
            | Database["public"]["Enums"]["training_location"]
            | null
          updated_at?: string
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          age?: number | null
          available_days?: number | null
          available_time_minutes?: number | null
          created_at?: string
          experience?: Database["public"]["Enums"]["experience_level"] | null
          goal_id?: number | null
          height_cm?: number | null
          id?: string
          onboarding_completed?: boolean
          sex?: Database["public"]["Enums"]["sex_type"] | null
          training_location?:
            | Database["public"]["Enums"]["training_location"]
            | null
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      program_phases: {
        Row: {
          advance_criteria: Database["public"]["Enums"]["advance_criteria"]
          advance_threshold: number
          created_at: string
          duration_weeks: number | null
          id: string
          name: string
          phase_index: number
          program_id: string
          template_id: string
        }
        Insert: {
          advance_criteria?: Database["public"]["Enums"]["advance_criteria"]
          advance_threshold: number
          created_at?: string
          duration_weeks?: number | null
          id?: string
          name: string
          phase_index: number
          program_id: string
          template_id: string
        }
        Update: {
          advance_criteria?: Database["public"]["Enums"]["advance_criteria"]
          advance_threshold?: number
          created_at?: string
          duration_weeks?: number | null
          id?: string
          name?: string
          phase_index?: number
          program_id?: string
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_phases_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_phases_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          created_at: string
          description: string | null
          experience: Database["public"]["Enums"]["exercise_level"]
          goal_id: number
          id: string
          is_active: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          experience: Database["public"]["Enums"]["exercise_level"]
          goal_id: number
          id?: string
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          experience?: Database["public"]["Enums"]["exercise_level"]
          goal_id?: number
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "programs_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      progress_photos: {
        Row: {
          angle: Database["public"]["Enums"]["photo_angle"] | null
          created_at: string
          id: string
          measurement_id: string | null
          storage_path: string | null
          taken_at: string
          url: string
          user_id: string
        }
        Insert: {
          angle?: Database["public"]["Enums"]["photo_angle"] | null
          created_at?: string
          id?: string
          measurement_id?: string | null
          storage_path?: string | null
          taken_at?: string
          url: string
          user_id: string
        }
        Update: {
          angle?: Database["public"]["Enums"]["photo_angle"] | null
          created_at?: string
          id?: string
          measurement_id?: string | null
          storage_path?: string | null
          taken_at?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_photos_measurement_id_fkey"
            columns: ["measurement_id"]
            isOneToOne: false
            referencedRelation: "body_measurements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_photos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: number
          progress: number | null
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: number
          progress?: number | null
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: number
          progress?: number | null
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_equipments: {
        Row: {
          equipment_id: number
          user_id: string
        }
        Insert: {
          equipment_id: number
          user_id: string
        }
        Update: {
          equipment_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_equipments_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_equipments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorite_exercises: {
        Row: {
          created_at: string
          exercise_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorite_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorite_exercises_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_limitations: {
        Row: {
          created_at: string
          limitation_id: number
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          limitation_id: number
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          limitation_id?: number
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_limitations_limitation_id_fkey"
            columns: ["limitation_id"]
            isOneToOne: false
            referencedRelation: "limitations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_limitations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_programs: {
        Row: {
          created_at: string
          current_phase_id: string | null
          id: string
          is_active: boolean
          phase_started_at: string
          program_id: string
          started_at: string
          status: Database["public"]["Enums"]["program_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          current_phase_id?: string | null
          id?: string
          is_active?: boolean
          phase_started_at?: string
          program_id: string
          started_at?: string
          status?: Database["public"]["Enums"]["program_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          current_phase_id?: string | null
          id?: string
          is_active?: boolean
          phase_started_at?: string
          program_id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["program_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_programs_current_phase_id_fkey"
            columns: ["current_phase_id"]
            isOneToOne: false
            referencedRelation: "program_phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_programs_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_programs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          completed_workout_id: string | null
          created_at: string
          exercise_id: string
          id: string
          notes: string | null
          performed_at: string
          reps_done: number | null
          rest_seconds: number | null
          set_number: number
          user_id: string
          weight_kg: number | null
          workout_exercise_id: string | null
        }
        Insert: {
          completed_workout_id?: string | null
          created_at?: string
          exercise_id: string
          id?: string
          notes?: string | null
          performed_at?: string
          reps_done?: number | null
          rest_seconds?: number | null
          set_number: number
          user_id: string
          weight_kg?: number | null
          workout_exercise_id?: string | null
        }
        Update: {
          completed_workout_id?: string | null
          created_at?: string
          exercise_id?: string
          id?: string
          notes?: string | null
          performed_at?: string
          reps_done?: number | null
          rest_seconds?: number | null
          set_number?: number
          user_id?: string
          weight_kg?: number | null
          workout_exercise_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_completed_workout_id_fkey"
            columns: ["completed_workout_id"]
            isOneToOne: false
            referencedRelation: "completed_workouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_workout_exercise_id_fkey"
            columns: ["workout_exercise_id"]
            isOneToOne: false
            referencedRelation: "workout_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stats: {
        Row: {
          current_streak: number
          first_workout_at: string | null
          last_workout_at: string | null
          longest_streak: number
          total_duration_seconds: number
          total_reps: number
          total_sets: number
          total_volume_kg: number
          total_workouts: number
          updated_at: string
          user_id: string
        }
        Insert: {
          current_streak?: number
          first_workout_at?: string | null
          last_workout_at?: string | null
          longest_streak?: number
          total_duration_seconds?: number
          total_reps?: number
          total_sets?: number
          total_volume_kg?: number
          total_workouts?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          current_streak?: number
          first_workout_at?: string | null
          last_workout_at?: string | null
          longest_streak?: number
          total_duration_seconds?: number
          total_reps?: number
          total_sets?: number
          total_volume_kg?: number
          total_workouts?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_workout_additions: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          reps: string
          rest_seconds: number
          sets: number
          user_id: string
          user_workout_id: string
          workout_day_id: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          reps?: string
          rest_seconds?: number
          sets?: number
          user_id: string
          user_workout_id: string
          workout_day_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          reps?: string
          rest_seconds?: number
          sets?: number
          user_id?: string
          user_workout_id?: string
          workout_day_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_workout_additions_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_workout_additions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_workout_additions_user_workout_id_fkey"
            columns: ["user_workout_id"]
            isOneToOne: false
            referencedRelation: "user_workouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_workout_additions_workout_day_id_fkey"
            columns: ["workout_day_id"]
            isOneToOne: false
            referencedRelation: "workout_days"
            referencedColumns: ["id"]
          },
        ]
      }
      user_workout_overrides: {
        Row: {
          created_at: string
          id: string
          reason: Database["public"]["Enums"]["override_reason"]
          substitute_exercise_id: string | null
          user_workout_id: string
          workout_exercise_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason: Database["public"]["Enums"]["override_reason"]
          substitute_exercise_id?: string | null
          user_workout_id: string
          workout_exercise_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: Database["public"]["Enums"]["override_reason"]
          substitute_exercise_id?: string | null
          user_workout_id?: string
          workout_exercise_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_workout_overrides_substitute_exercise_id_fkey"
            columns: ["substitute_exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_workout_overrides_user_workout_id_fkey"
            columns: ["user_workout_id"]
            isOneToOne: false
            referencedRelation: "user_workouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_workout_overrides_workout_exercise_id_fkey"
            columns: ["workout_exercise_id"]
            isOneToOne: false
            referencedRelation: "workout_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      user_workouts: {
        Row: {
          assigned_at: string
          created_at: string
          id: string
          is_active: boolean
          program_phase_id: string | null
          source: Database["public"]["Enums"]["workout_source"]
          template_id: string
          user_id: string
          user_program_id: string | null
        }
        Insert: {
          assigned_at?: string
          created_at?: string
          id?: string
          is_active?: boolean
          program_phase_id?: string | null
          source?: Database["public"]["Enums"]["workout_source"]
          template_id: string
          user_id: string
          user_program_id?: string | null
        }
        Update: {
          assigned_at?: string
          created_at?: string
          id?: string
          is_active?: boolean
          program_phase_id?: string | null
          source?: Database["public"]["Enums"]["workout_source"]
          template_id?: string
          user_id?: string
          user_program_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_workouts_program_phase_id_fkey"
            columns: ["program_phase_id"]
            isOneToOne: false
            referencedRelation: "program_phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_workouts_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_workouts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_workouts_user_program_id_fkey"
            columns: ["user_program_id"]
            isOneToOne: false
            referencedRelation: "user_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      workout_days: {
        Row: {
          created_at: string
          day_index: number
          estimated_duration_minutes: number | null
          focus: string | null
          id: string
          name: string
          template_id: string
        }
        Insert: {
          created_at?: string
          day_index: number
          estimated_duration_minutes?: number | null
          focus?: string | null
          id?: string
          name: string
          template_id: string
        }
        Update: {
          created_at?: string
          day_index?: number
          estimated_duration_minutes?: number | null
          focus?: string | null
          id?: string
          name?: string
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_days_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_exercises: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          notes: string | null
          position: number
          reps: string
          rest_seconds: number
          sets: number
          workout_day_id: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          notes?: string | null
          position: number
          reps: string
          rest_seconds?: number
          sets: number
          workout_day_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          notes?: string | null
          position?: number
          reps?: string
          rest_seconds?: number
          sets?: number
          workout_day_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_workout_day_id_fkey"
            columns: ["workout_day_id"]
            isOneToOne: false
            referencedRelation: "workout_days"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_templates: {
        Row: {
          created_at: string
          days_per_week: number
          description: string | null
          experience: Database["public"]["Enums"]["exercise_level"]
          goal_id: number
          id: string
          is_active: boolean
          min_location: Database["public"]["Enums"]["training_location"]
          name: string
          priority: number
          session_duration_minutes: number
          split_type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          days_per_week: number
          description?: string | null
          experience: Database["public"]["Enums"]["exercise_level"]
          goal_id: number
          id?: string
          is_active?: boolean
          min_location?: Database["public"]["Enums"]["training_location"]
          name: string
          priority?: number
          session_duration_minutes: number
          split_type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          days_per_week?: number
          description?: string | null
          experience?: Database["public"]["Enums"]["exercise_level"]
          goal_id?: number
          id?: string
          is_active?: boolean
          min_location?: Database["public"]["Enums"]["training_location"]
          name?: string
          priority?: number
          session_duration_minutes?: number
          split_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_templates_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      achievement_criteria:
        | "first_workout"
        | "consecutive_days"
        | "total_workouts"
        | "total_volume_kg"
        | "load_progress"
        | "perfect_month"
        | "total_sets"
        | "body_weight_change"
      advance_criteria: "workouts_completed" | "completion_pct" | "time_weeks"
      exercise_level: "beginner" | "intermediate" | "advanced"
      experience_level: "never" | "up_to_6m" | "6m_to_2y" | "over_2y"
      media_type: "image" | "gif" | "video"
      muscle_role: "primary" | "secondary"
      override_reason: "equipment" | "limitation" | "manual"
      photo_angle: "front" | "side" | "back"
      program_status: "active" | "completed" | "paused"
      restriction_level: "avoid" | "caution"
      sex_type: "male" | "female" | "other"
      training_location: "home" | "condo" | "small_gym" | "full_gym"
      user_role: "user" | "admin"
      workout_source: "algorithm" | "manual" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      achievement_criteria: [
        "first_workout",
        "consecutive_days",
        "total_workouts",
        "total_volume_kg",
        "load_progress",
        "perfect_month",
        "total_sets",
        "body_weight_change",
      ],
      advance_criteria: ["workouts_completed", "completion_pct", "time_weeks"],
      exercise_level: ["beginner", "intermediate", "advanced"],
      experience_level: ["never", "up_to_6m", "6m_to_2y", "over_2y"],
      media_type: ["image", "gif", "video"],
      muscle_role: ["primary", "secondary"],
      override_reason: ["equipment", "limitation", "manual"],
      photo_angle: ["front", "side", "back"],
      program_status: ["active", "completed", "paused"],
      restriction_level: ["avoid", "caution"],
      sex_type: ["male", "female", "other"],
      training_location: ["home", "condo", "small_gym", "full_gym"],
      user_role: ["user", "admin"],
      workout_source: ["algorithm", "manual", "admin"],
    },
  },
} as const
