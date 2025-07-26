// src/hooks/useChampionshipResults.ts - FIXED VERSION that shows ALL participants
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface ChampionshipParticipant {
  participant_key: string;
  participant_type: "registered" | "manual_linked" | "manual_unlinked";
  participant_name: string;
  user_id?: string;
  manual_participant_id?: string;
  class_name: string;
  rally_scores: ChampionshipRallyScore[];
  total_rally_points: number;
  total_extra_points: number;
  total_overall_points: number;
  rounds_participated: number;
  championship_position?: number;
  is_linked: boolean;
}

export interface ChampionshipRallyScore {
  rally_id: string;
  rally_name: string;
  round_number: number;
  etapp_number: number;
  competition_date: string;
  rally_points: number; // total_points andmebaasist
  extra_points: number; // extra_points andmebaasist
  overall_points: number; // PEAMINE: See kuvatakse tabelis!
  participated: boolean;
  class_position?: number;
}

export interface ChampionshipResults {
  championship_id: string;
  championship_name: string;
  participants: ChampionshipParticipant[];
  total_rounds: number;
  linked_participants: number;
  unlinked_participants: number;
  warnings: string[];
}

export function useChampionshipResults(championshipId: string) {
  return useQuery({
    queryKey: ["championship-results", championshipId],
    queryFn: async (): Promise<ChampionshipResults | null> => {
      if (!championshipId) return null;

      try {
        // Get championship info
        const { data: championship, error: championshipError } = await supabase
          .from("championships")
          .select("id, name")
          .eq("id", championshipId)
          .single();

        if (championshipError) throw championshipError;

        // Get championship rallies
        const { data: championshipRallies, error: ralliesError } =
          await supabase
            .from("championship_rallies")
            .select(
              `
            rally_id,
            round_number,
            rallies!inner(name, competition_date)
          `
            )
            .eq("championship_id", championshipId)
            .eq("is_active", true);

        if (ralliesError) throw ralliesError;

        if (!championshipRallies || championshipRallies.length === 0) {
          console.warn("No rallies found for championship:", championshipId);
          return {
            championship_id: championshipId,
            championship_name: championship.name,
            participants: [],
            total_rounds: 0,
            linked_participants: 0,
            unlinked_participants: 0,
            warnings: ["No rallies found in championship"],
          };
        }

        // Sort rallies by date and assign etapp numbers
        const sortedRallies = championshipRallies
          .map((cr) => ({
            ...cr,
            rally_name: (cr.rallies as any)?.name || "Unknown Rally",
            competition_date:
              (cr.rallies as any)?.competition_date || new Date().toISOString(),
          }))
          .sort(
            (a, b) =>
              new Date(a.competition_date).getTime() -
              new Date(b.competition_date).getTime()
          )
          .map((rally, index) => ({
            ...rally,
            etapp_number: index + 1,
          }));

        // Get ALL rally results with proper joins for registered users
        const rallyIds = sortedRallies.map((r) => r.rally_id);
        const { data: allResults, error: resultsError } = await supabase
          .from("rally_results")
          .select(
            `
    rally_id,
    participant_name,
    user_id,
    manual_participant_id,
    class_name,
    total_points,
    extra_points,
    class_position
  `
          )
          .in("rally_id", rallyIds);

        if (resultsError) throw resultsError;

        // For registered users, we need to fetch their data separately
        const userIds = Array.from(
          new Set(
            (allResults || []).filter((r) => r.user_id).map((r) => r.user_id)
          )
        );

        

        let userData: Record<string, any> = {};
        let classData: Record<string, string> = {};

        if (userIds.length > 0) {
          // Get user data
          const { data: users } = await supabase
            .from("users")
            .select("id, player_name")
            .in("id", userIds);

          users?.forEach((u) => {
            userData[u.id] = u.player_name;
          });

          // Get class data through registrations
          const { data: registrations } = await supabase
            .from("rally_registrations")
            .select(
              `
      user_id,
      rally_id,
      game_classes!inner(name)
    `
            )
            .in("rally_id", rallyIds)
            .in("user_id", userIds);

          registrations?.forEach((reg) => {
            const key = `${reg.user_id}-${reg.rally_id}`;
            classData[key] = (reg.game_classes as any).name;
          });
        }

        // Process results to get actual names
        const results = (allResults || [])
          .map((result) => {
            let actualParticipantName = result.participant_name;
            let actualClassName = result.class_name;

            // For registered users, get names from our fetched data
            if (result.user_id && !result.participant_name) {
              actualParticipantName =
                userData[result.user_id] || "Unknown Player";
              const classKey = `${result.user_id}-${result.rally_id}`;
              actualClassName = classData[classKey] || "Unknown Class";
            }

            return {
              ...result,
              participant_name: actualParticipantName,
              class_name: actualClassName,
            };
          })
          .filter(
            (r) => r.participant_name && r.participant_name.trim() !== ""
          );

        // Debug logging - see what we got
        const uniqueParticipants = new Set(
          results.map((r) => `${r.participant_name}|${r.class_name}`)
        );

        

        // Group participants and calculate totals
        const participantMap = new Map<string, ChampionshipParticipant>();
        let linkedCount = 0;
        let unlinkedCount = 0;

        // Process each result
        results.forEach((result) => {
          // Skip if participant name is empty/null
          if (
            !result.participant_name ||
            result.participant_name.trim() === ""
          ) {
            console.warn(
              "Skipping result with empty participant name:",
              result
            );
            return;
          }

          // Determine participant identification
          let participantKey: string;
          let participantType:
            | "registered"
            | "manual_linked"
            | "manual_unlinked";
          let isLinked: boolean;

          if (result.user_id) {
            participantKey = `user_${result.user_id}_${result.class_name}`;
            participantType = "registered";
            isLinked = true;
          } else if (result.manual_participant_id) {
            participantKey = `manual_${result.manual_participant_id}_${result.class_name}`;
            participantType = "manual_linked";
            isLinked = true;
          } else {
            participantKey = `unlinked_${result.participant_name}_${result.class_name}`;
            participantType = "manual_unlinked";
            isLinked = false;
          }

          // Create or get participant
          if (!participantMap.has(participantKey)) {
            participantMap.set(participantKey, {
              participant_key: participantKey,
              participant_type: participantType,
              participant_name: result.participant_name,
              user_id: result.user_id || undefined,
              manual_participant_id: result.manual_participant_id || undefined,
              class_name: result.class_name,
              rally_scores: [],
              total_rally_points: 0,
              total_extra_points: 0,
              total_overall_points: 0,
              rounds_participated: 0,
              is_linked: isLinked,
            });

            if (isLinked) linkedCount++;
            else unlinkedCount++;
          }
        });

        // Add rally scores for each participant
        participantMap.forEach((participant) => {
          sortedRallies.forEach((rally) => {
            // Find all results for this participant in this rally
            const participantResults = results.filter(
              (r) =>
                r.rally_id === rally.rally_id &&
                r.participant_name === participant.participant_name &&
                r.class_name === participant.class_name
            );

            // If there are multiple results for the same participant/rally, take the best one
            let bestResult = null;
            let maxOverallPoints = 0;

            participantResults.forEach((result) => {
              const rallyPoints = result.total_points || 0;
              const extraPoints = result.extra_points || 0;
              const overallPoints = rallyPoints + extraPoints;

              if (overallPoints > maxOverallPoints || bestResult === null) {
                maxOverallPoints = overallPoints;
                bestResult = result;
              }
            });

            // Calculate points (use best result if found, otherwise zeros)
            const rallyPoints = bestResult?.total_points || 0;
            const extraPoints = bestResult?.extra_points || 0;
            const overallPoints = rallyPoints + extraPoints;

            // Determine if participant participated in this rally
            // They participated if they have points OR a class position OR any result entry
            const participated =
              overallPoints > 0 ||
              (bestResult?.class_position !== null &&
                bestResult?.class_position !== undefined) ||
              participantResults.length > 0;

            const rallyScore: ChampionshipRallyScore = {
              rally_id: rally.rally_id,
              rally_name: rally.rally_name,
              round_number: rally.round_number,
              etapp_number: rally.etapp_number,
              competition_date: rally.competition_date,
              rally_points: rallyPoints,
              extra_points: extraPoints,
              overall_points: overallPoints,
              participated: participated,
              class_position: bestResult?.class_position || undefined,
            };

            participant.rally_scores.push(rallyScore);

            // Add to totals if participated
            if (participated) {
              participant.total_rally_points += rallyPoints;
              participant.total_extra_points += extraPoints;
              participant.total_overall_points += overallPoints;
              participant.rounds_participated++;
            }
          });

          // Sort rally scores by etapp number
          participant.rally_scores.sort(
            (a, b) => a.etapp_number - b.etapp_number
          );
        });

        // Calculate championship positions by class
        const participantsByClass = new Map<
          string,
          ChampionshipParticipant[]
        >();
        participantMap.forEach((participant) => {
          if (!participantsByClass.has(participant.class_name)) {
            participantsByClass.set(participant.class_name, []);
          }
          participantsByClass.get(participant.class_name)!.push(participant);
        });

        // Sort each class and assign positions
        participantsByClass.forEach((classParticipants, className) => {
          classParticipants.sort((a, b) => {
            // Primary: total overall points (descending)
            if (b.total_overall_points !== a.total_overall_points) {
              return b.total_overall_points - a.total_overall_points;
            }
            // Secondary: total extra points (descending)
            if (b.total_extra_points !== a.total_extra_points) {
              return b.total_extra_points - a.total_extra_points;
            }
            // Tertiary: rounds participated (descending)
            return b.rounds_participated - a.rounds_participated;
          });

          classParticipants.forEach((participant, index) => {
            participant.championship_position = index + 1;
          });
        });

        const participants = Array.from(participantMap.values());
        const warnings: string[] = [];

        if (unlinkedCount > 0) {
          warnings.push(`${unlinkedCount} unlinked participants found`);
        }

        return {
          championship_id: championshipId,
          championship_name: championship.name,
          participants: participants,
          total_rounds: sortedRallies.length,
          linked_participants: linkedCount,
          unlinked_participants: unlinkedCount,
          warnings: warnings,
        };
      } catch (error) {
        console.error("❌ Error in championship results calculation:", error);
        throw error;
      }
    },
    enabled: !!championshipId,
    staleTime: 2 * 60 * 1000,
  });
}
