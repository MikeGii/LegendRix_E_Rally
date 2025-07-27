// src/hooks/useApprovedRallies.ts - PARANDATUD klassi ja osaleja nimede loogikas + is_public tugi
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface ApprovedRally {
  id: string;
  name: string;
  description?: string;
  competition_date: string;
  max_participants?: number;
  game_name: string;
  game_type_name: string;
  approved_at: string;
  approved_by: string;
  total_participants: number;
  participants_with_results: number;
  is_public: boolean;
}

export interface ApprovedRallyResult {
  id: string;
  participant_name: string;
  user_id?: string;
  class_name: string;
  overall_position: number;
  class_position: number | null;
  total_points: number;
  extra_points: number; // 👈 ADD THIS LINE
  overall_points: number; // 👈 ADD THIS LINE (calculated)
  registration_date?: string;
}

// Hook to get all approved rallies (admin view - shows all)
export function useApprovedRallies() {
  return useQuery({
    queryKey: ["approved-rallies"],
    queryFn: async (): Promise<ApprovedRally[]> => {
      console.log("🔄 Laadin kõiki heakskiidetud rallyeid...");

      const { data, error } = await supabase
        .from("approved_rallies")
        .select("*")
        .order("competition_date", { ascending: false });

      if (error) {
        console.error("Viga heakskiidetud rallyede laadimisel:", error);
        throw error;
      }

      console.log(`✅ Laaditud ${data?.length || 0} heakskiidetud rallyeid`);
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutit - avalikud andmed võivad kauem vahemälus olla
  });
}

// NEW HOOK: Get only PUBLIC approved rallies (for landing page)
export function usePublicApprovedRallies() {
  return useQuery({
    queryKey: ["public-approved-rallies"],
    queryFn: async (): Promise<ApprovedRally[]> => {
      console.log("🔄 Laadin avalikuks märgitud heakskiidetud rallyeid...");

      // First, get rally IDs that are marked as public
      const { data: publicRallyStatus, error: statusError } = await supabase
        .from("rally_results_status")
        .select("rally_id")
        .eq("results_approved", true)
        .eq("is_public", true);

      if (statusError) {
        console.error("Viga avalike rally staatuste laadimisel:", statusError);
        throw statusError;
      }

      if (!publicRallyStatus || publicRallyStatus.length === 0) {
        console.log("Avalikke rallyeid ei leitud");
        return [];
      }

      // Get the rally IDs
      const publicRallyIds = publicRallyStatus.map((status) => status.rally_id);

      // Now get the approved rallies that are in the public list
      const { data, error } = await supabase
        .from("approved_rallies")
        .select("*")
        .in("id", publicRallyIds)
        .order("competition_date", { ascending: false });

      if (error) {
        console.error("Viga avalike heakskiidetud rallyede laadimisel:", error);
        throw error;
      }

      console.log(
        `✅ Laaditud ${
          data?.length || 0
        } avalikuks märgitud heakskiidetud rallyeid`
      );
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Hook to check if a specific rally is public
export function useIsRallyPublic(rallyId: string) {
  return useQuery({
    queryKey: ["rally-is-public", rallyId],
    queryFn: async (): Promise<boolean> => {
      if (!rallyId) return false;

      const { data, error } = await supabase
        .from("rally_results_status")
        .select("is_public")
        .eq("rally_id", rallyId)
        .eq("results_approved", true)
        .single();

      if (error || !data) {
        return false;
      }

      return data.is_public || false;
    },
    enabled: !!rallyId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook to get detailed results for a specific approved rally
export function useApprovedRallyResults(rallyId: string) {
  return useQuery({
    queryKey: ["approved-rally-results", rallyId],
    queryFn: async (): Promise<ApprovedRallyResult[]> => {
      if (!rallyId) return [];

      console.log("🔄 Laadin heakskiidetud rally tulemusi:", rallyId);

      // Kõigepealt kontrollin, et rally on tõesti heakskiidetud
      const { data: rallyStatus, error: statusError } = await supabase
        .from("rally_results_status")
        .select("results_approved")
        .eq("rally_id", rallyId)
        .eq("results_approved", true)
        .single();

      if (statusError || !rallyStatus) {
        console.warn(
          "Rally tulemused pole heakskiidetud või rallyeid ei leitud:",
          rallyId
        );
        return [];
      }

      // Laadin kõik tulemused
      const { data: results, error } = await supabase
        .from("rally_results")
        .select(
          `
          id,
          participant_name,
          user_id,
          registration_id,
          class_name,
          overall_position,
          class_position,
          total_points,
          extra_points
        `
        )
        .eq("rally_id", rallyId)
        .not("class_position", "is", null)
        .order("class_name", { ascending: true })
        .order("class_position", { ascending: true });

      if (error) {
        console.error("Viga heakskiidetud rally tulemuste laadimisel:", error);
        throw error;
      }

      if (!results || results.length === 0) {
        console.log("Tulemusi ei leitud");
        return [];
      }

      // Laadin registreeritud osaliste andmed eraldi päringuga
      const registrationIds = results
        .filter((r) => r.registration_id)
        .map((r) => r.registration_id);

      let registrationsMap = new Map();
      let usersMap = new Map();
      let classesMap = new Map();

      if (registrationIds.length > 0) {
        // Laadin registreeringud koos user_id ja class_id-ga
        const { data: registrations } = await supabase
          .from("rally_registrations")
          .select(
            `
            id,
            user_id,
            class_id,
            registration_date
          `
          )
          .in("id", registrationIds);

        if (registrations) {
          registrations.forEach((reg) => {
            registrationsMap.set(reg.id, reg);
          });

          // Laadin kasutajate andmed
          const userIds = registrations.map((r) => r.user_id).filter(Boolean);

          if (userIds.length > 0) {
            const { data: users } = await supabase
              .from("users")
              .select("id, player_name")
              .in("id", userIds);

            if (users) {
              users.forEach((user) => {
                usersMap.set(user.id, user);
              });
            }
          }

          // Laadin klasside andmed
          const classIds = registrations.map((r) => r.class_id).filter(Boolean);

          if (classIds.length > 0) {
            const { data: classes } = await supabase
              .from("game_classes")
              .select("id, name")
              .in("id", classIds);

            if (classes) {
              classes.forEach((gameClass) => {
                classesMap.set(gameClass.id, gameClass);
              });
            }
          }
        }
      }

      // Teisendan tulemused avalikuks vaatamiseks
      const transformedResults: ApprovedRallyResult[] = results.map(
        (result) => {
          let participantName: string;
          let className: string;
          let registrationDate: string | undefined;

          if (result.registration_id) {
            // REGISTREERITUD OSALEJA - kasutan rally_registrations tabeli andmeid
            const registration = registrationsMap.get(result.registration_id);
            if (registration) {
              const user = usersMap.get(registration.user_id);
              const gameClass = classesMap.get(registration.class_id);

              participantName =
                user?.player_name ||
                `Kasutaja-${registration.user_id?.slice(-8)}` ||
                "Tundmatu mängija";
              className = gameClass?.name || "Tundmatu klass";
              registrationDate = registration.registration_date;
            } else {
              // Fallback kui registreeringu andmeid ei leitud
              participantName = result.participant_name || "Tundmatu mängija";
              className = result.class_name || "Tundmatu klass";
            }
          } else if (result.user_id) {
            // REGISTERED USER WITHOUT REGISTRATION - check if we can get name from users map
            const user = Array.from(usersMap.values()).find(
              (u) => u.id === result.user_id
            );
            participantName =
              user?.player_name ||
              result.participant_name ||
              "Tundmatu mängija";
            className = result.class_name || "Tundmatu klass";
          } else {
            // MANUAALSELT LISATUD OSALEJA - kasutan rally_results tabeli andmeid
            participantName = result.participant_name || "Tundmatu mängija";
            className = result.class_name || "Tundmatu klass";
          }

          return {
            id: result.id,
            participant_name: participantName,
            user_id: result.user_id,
            class_name: className,
            overall_position: result.overall_position || 0,
            class_position: result.class_position
              ? parseInt(result.class_position.toString())
              : null,
            total_points: result.total_points || 0,
            extra_points: result.extra_points || 0,
            overall_points:
              (result.total_points || 0) + (result.extra_points || 0),
            registration_date: registrationDate,
          };
        }
      );

      console.log(
        `✅ Laaditud ${transformedResults.length} heakskiidetud tulemust sorteeritud klassi positsiooni järgi`
      );
      return transformedResults;
    },
    enabled: !!rallyId,
    staleTime: 5 * 60 * 1000, // 5 minutit
  });
}

// Hook to get rally classes for an approved rally
export function useApprovedRallyClasses(rallyId: string) {
  return useQuery({
    queryKey: ["approved-rally-classes", rallyId],
    queryFn: async (): Promise<string[]> => {
      if (!rallyId) return [];

      console.log("🔄 Laadin klasse heakskiidetud rally jaoks:", rallyId);

      // Kõigepealt kontrollin, et rally on heakskiidetud
      const { data: rallyStatus } = await supabase
        .from("rally_results_status")
        .select("results_approved")
        .eq("rally_id", rallyId)
        .eq("results_approved", true)
        .single();

      if (!rallyStatus) return [];

      // Laadin unikaalsed klassid tulemustest
      const { data: results, error } = await supabase
        .from("rally_results")
        .select("class_name")
        .eq("rally_id", rallyId)
        .not("class_name", "is", null);

      if (error) {
        console.error("Viga rally klasside laadimisel:", error);
        return [];
      }

      const uniqueClasses = Array.from(
        new Set((results || []).map((r) => r.class_name).filter(Boolean))
      );
      console.log(`✅ Leitud ${uniqueClasses.length} klassi`);
      return uniqueClasses;
    },
    enabled: !!rallyId,
    staleTime: 10 * 60 * 1000, // 10 minutit - klassid ei muutu tihti
  });
}

// Hook to get statistics for the public leaderboard page
export function useLeaderboardStats() {
  return useQuery({
    queryKey: ["leaderboard-stats"],
    queryFn: async () => {
      console.log("🔄 Laadin edetabeli statistikat...");

      const { data: stats, error } = await supabase.rpc(
        "get_leaderboard_stats"
      );

      if (error) {
        console.error("Viga edetabeli statistika laadimisel:", error);
        // Tagastan vaikimisi statistika kui funktsioon ei eksisteeri
        return {
          total_approved_rallies: 0,
          total_participants: 0,
          latest_rally_date: null,
        };
      }

      return stats;
    },
    staleTime: 15 * 60 * 1000, // 15 minutit
  });
}
