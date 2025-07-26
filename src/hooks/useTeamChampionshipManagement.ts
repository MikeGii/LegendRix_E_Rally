// src/hooks/useTeamChampionshipManagement.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

// Types
export interface TeamChampionship {
  id: string;
  name: string;
  description?: string;
  season_year?: number;
  game_id?: string;
  game_type_id?: string;
  game_name?: string;
  game_type_name?: string;
  is_active: boolean;
  status: "ongoing" | "completed";
  created_at: string;
  total_rallies?: number;
  championship_type: "team";
  completed_at?: string;
}

export interface TeamChampionshipResults {
  team_id: string;
  team_name: string;
  class_id: string;
  class_name: string;
  total_points: number;
  rallies_participated: number;
  class_position: number;
  overall_position: number;
  avg_participating_members: number;
  avg_scoring_members: number;
  rally_scores: Array<{
    rally_id: string;
    rally_name: string;
    round_number: number;
    points: number;
    position: number;
    participating_members: number;
    scoring_members: number;
  }>;
}

// Query Keys
export const teamChampionshipKeys = {
  all: ["team-championships"] as const,
  lists: () => [...teamChampionshipKeys.all, "list"] as const,
  detail: (id: string) => [...teamChampionshipKeys.all, "detail", id] as const,
  results: (id: string) =>
    [...teamChampionshipKeys.all, "results", id] as const,
};

// Hook to fetch team championships
export function useTeamChampionships() {
  return useQuery({
    queryKey: teamChampionshipKeys.lists(),
    queryFn: async (): Promise<TeamChampionship[]> => {
      console.log("🔄 Loading team championships...");

      const { data, error } = await supabase
        .from("championships")
        .select(
          `
          *,
          game:games(name),
          game_type:game_types(name),
          championship_rallies(rally_id)
        `
        )
        .eq("championship_type", "team")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading team championships:", error);
        throw error;
      }

      const championships = (data || []).map((championship) => ({
        ...championship,
        game_name: championship.game?.name || null,
        game_type_name: championship.game_type?.name || null,
        total_rallies: championship.championship_rallies?.length || 0,
        championship_type: "team" as const,
      }));

      console.log(`✅ Loaded ${championships.length} team championships`);
      return championships;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Hook to create team championship
export function useCreateTeamChampionship() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      season_year?: number;
      game_id?: string;
      game_type_id?: string;
    }) => {
      console.log("🔄 Creating team championship:", data.name);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("Authentication required");
      }

      const { data: championship, error } = await supabase
        .from("championships")
        .insert({
          ...data,
          championship_type: "team",
          is_active: true,
          status: "ongoing",
          created_by: user.id,
          activated_at: new Date().toISOString(),
          activated_by: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating team championship:", error);
        throw error;
      }

      console.log("✅ Team championship created:", championship.name);
      return championship;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamChampionshipKeys.lists() });
    },
  });
}

// Hook to get team championship results
export function useTeamChampionshipResults(championshipId: string) {
  return useQuery({
    queryKey: teamChampionshipKeys.results(championshipId),
    queryFn: async (): Promise<TeamChampionshipResults[]> => {
      if (!championshipId) return [];

      console.log("🔄 Loading team championship results for:", championshipId);

      const { data, error } = await supabase.rpc(
        "get_team_championship_results",
        { p_championship_id: championshipId }
      );

      if (error) {
        console.error("Error loading team championship results:", error);
        throw error;
      }

      console.log(`✅ Loaded ${data?.length || 0} team results`);
      return data || [];
    },
    enabled: !!championshipId,
    staleTime: 2 * 60 * 1000,
  });
}
