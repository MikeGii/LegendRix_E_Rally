import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface PublicChampionship {
  id: string;
  name: string;
  season_year: number;
  is_active: boolean;
  status: "ongoing" | "completed";
  total_rallies: number;
  total_participants: number;
  game_name?: string;
  game_type_name?: string;
}

export function usePublicChampionships() {
  return useQuery({
    queryKey: ["public-championships"],
    queryFn: async (): Promise<PublicChampionship[]> => {
      const { data, error } = await supabase
        .from("championships")
        .select(
          `
          id,
          name,
          season_year,
          is_active,
          status,
          game_id,
          game_type_id,
          games(name),
          game_types(name),
          championship_rallies(
            rally_id,
            rallies(
              rally_results(participant_name)
            )
          )
        `
        )
        .eq("is_active", true)
        .neq("championship_type", "team")
        .order("season_year", { ascending: false })
        .order("name");

      if (error) {
        console.error("Error loading public championships:", error);
        throw error;
      }

      // Process championships and fetch participant counts separately
      const championshipsWithCounts = await Promise.all(
        (data || []).map(async (championship) => {
          let totalRallies = 0;
          const rallyIds: string[] = [];

          // Collect rally IDs
          if (
            championship.championship_rallies &&
            Array.isArray(championship.championship_rallies)
          ) {
            championship.championship_rallies.forEach((cr: any) => {
              totalRallies++;
              if (cr.rally_id) {
                rallyIds.push(cr.rally_id);
              }
            });
          }

          // Get participant count if there are rallies
          let participantCount = 0;
          if (rallyIds.length > 0) {
            const { data: results } = await supabase
              .from("rally_results")
              .select("participant_name, user_id")
              .in("rally_id", rallyIds);

            // After counting unique participants
            const uniqueParticipants = new Set<string>();
            results?.forEach((result) => {
              if (result.user_id) {
                // For registered users, use user_id as the unique identifier
                uniqueParticipants.add(result.user_id);
              } else if (result.participant_name) {
                // For manual participants, use participant_name
                uniqueParticipants.add(`manual_${result.participant_name}`);
              }
            });
            participantCount = uniqueParticipants.size;
          }

          return {
            id: championship.id,
            name: championship.name,
            season_year: championship.season_year,
            is_active: championship.is_active,
            status: championship.status || "ongoing",
            total_rallies: totalRallies,
            total_participants: participantCount,
            // Access games and game_types as arrays (Supabase returns them as arrays)
            game_name:
              championship.games &&
              Array.isArray(championship.games) &&
              championship.games.length > 0
                ? championship.games[0].name
                : null,
            game_type_name:
              championship.game_types &&
              Array.isArray(championship.game_types) &&
              championship.game_types.length > 0
                ? championship.game_types[0].name
                : null,
          };
        })
      );

      return championshipsWithCounts;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - public data doesn't change often
  });
}
