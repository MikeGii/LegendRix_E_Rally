// src/hooks/usePublicTeamChampionships.ts - FIXED WITH PROPER TYPES
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface PublicTeamChampionship {
  id: string;
  name: string;
  description?: string;
  season_year: number;
  game_name?: string;
  total_rallies: number;
  total_teams: number;
  latest_rally_date?: string;
}

// Define the response type structure
type ChampionshipResponse = {
  id: string;
  name: string;
  description?: string;
  season_year?: number;
  game?: {
    name: string;
  };
  championship_rallies?: Array<{
    rally_id: string;
    rallies?: {
      id: string;
      competition_date: string;
    };
  }>;
};

export function usePublicTeamChampionships() {
  return useQuery({
    queryKey: ["public-team-championships"],
    queryFn: async (): Promise<PublicTeamChampionship[]> => {
      console.log("🔄 Loading public team championships...");

      // Get active team championships with proper typing
      const { data: championships, error } = await supabase
        .from("championships")
        .select(
          `
          id,
          name,
          description,
          season_year,
          game:games(name),
          championship_rallies(
            rally_id,
            rallies(
              id,
              competition_date
            )
          )
        `
        )
        .eq("championship_type", "team")
        .eq("is_active", true)
        .eq("status", "ongoing")
        .order("created_at", { ascending: false })
        .returns<ChampionshipResponse[]>();

      if (error) {
        console.error("Error loading public team championships:", error);
        throw error;
      }

      // Get team counts for each championship
      const championshipIds = championships?.map((c) => c.id) || [];

      const { data: teamCounts } = await supabase
        .from("team_championship_standings")
        .select("championship_id, team_id")
        .in("championship_id", championshipIds);

      // Process and format the data with proper type handling
      const processedChampionships =
        championships?.map((championship) => {
          // Safely access nested rally data
          const rallies = championship.championship_rallies || [];

          // Count unique teams
          const uniqueTeamIds = new Set(
            teamCounts
              ?.filter((tc) => tc.championship_id === championship.id)
              .map((tc) => tc.team_id) || []
          );
          const teamCount = uniqueTeamIds.size;

          // Find latest rally date from the nested structure
          const latestRallyDate = rallies
            .map((cr) => cr.rallies?.competition_date)
            .filter((date): date is string => Boolean(date))
            .sort()
            .pop();

          return {
            id: championship.id,
            name: championship.name,
            description: championship.description,
            season_year: championship.season_year || new Date().getFullYear(),
            game_name: championship.game?.name || null,
            total_rallies: rallies.length,
            total_teams: teamCount,
            latest_rally_date: latestRallyDate,
          };
        }) || [];

      console.log(
        `✅ Loaded ${processedChampionships.length} public team championships`
      );
      return processedChampionships;
    },
    staleTime: 5 * 60 * 1000,
  });
}
