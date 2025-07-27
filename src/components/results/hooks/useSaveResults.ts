// src/components/results/hooks/useSaveResults.ts - FIXED: Handle registered vs manual participants correctly
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { resultsKeys } from "@/hooks/useResultsManagement";

interface SaveResultsData {
  rallyId: string;
  allParticipants: Array<{
    participantId: string;
    playerName: string;
    className: string;
    overallPosition: number | null;
    classPosition: number | null;
    totalPoints: number | null;
    extraPoints: number | null;
  }>;
}

interface SaveResultsOptions {
  rallyId: string;
  onSaveSuccess?: () => void;
}

export function useSaveResults({ rallyId, onSaveSuccess }: SaveResultsOptions) {
  const queryClient = useQueryClient();

  const saveResultsMutation = useMutation({
    mutationFn: async ({ rallyId, allParticipants }: SaveResultsData) => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("Kasutaja pole autentitud");
      }

      const currentTime = new Date().toISOString();
      let savedCount = 0;
      let errorCount = 0;

      for (const participant of allParticipants) {
        try {
          const hasResults =
            participant.overallPosition !== null ||
            participant.classPosition !== null ||
            (participant.totalPoints !== null &&
              participant.totalPoints !== 0) ||
            (participant.extraPoints !== null && participant.extraPoints !== 0);

          if (!hasResults) {
            continue; // Skip participants with no results
          }

          // FIXED: Determine participant type and get correct data
          console.log(
            `🔍 Processing participant: ${participant.playerName} (ID: ${participant.participantId})`
          );

          // Check if this is a registered user or manual participant
          const { data: registrationData, error: regError } = await supabase
            .from("rally_registrations")
            .select("id, user_id, rally_id, class_id")
            .eq("id", participant.participantId)
            .single();

          const isRegisteredUser = !regError && registrationData;
          console.log(
            `📋 Participant type: ${
              isRegisteredUser ? "Registered User" : "Manual Participant"
            }`
          );

          if (isRegisteredUser) {
            // Handle registered user
            await saveRegisteredUserResults(
              rallyId,
              registrationData,
              participant,
              user.id,
              currentTime
            );
          } else {
            // Handle manual participant - look in rally_results table
            const { data: manualData, error: manualError } = await supabase
              .from("rally_results")
              .select("id, user_id, participant_name")
              .eq("id", participant.participantId)
              .is("user_id", null) // Manual participants have user_id = null
              .single();

            if (manualError) {
              throw new Error(
                `Manual participant not found: ${participant.playerName}`
              );
            }

            await saveManualParticipantResults(
              manualData.id,
              participant,
              user.id,
              currentTime
            );
          }

          savedCount++;
          console.log(`✅ Saved results for: ${participant.playerName}`);
        } catch (error) {
          console.error(`❌ Error saving ${participant.playerName}:`, error);
          errorCount++;
        }
      }

      if (errorCount > 0 && savedCount === 0) {
        throw new Error("Ükski tulemus ei salvestunud");
      }

      // Update rally results status
      await updateRallyResultsStatus(rallyId);

      return { savedCount, errorCount };
    },
    onSuccess: (data) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({
        queryKey: resultsKeys.rally_participants(rallyId),
      });
      queryClient.invalidateQueries({
        queryKey: ["rally-results-status", rallyId],
      });

      if (data.savedCount > 0) {
        alert(`Edukalt salvestatud: ${data.savedCount} osaleja tulemused`);
      }

      onSaveSuccess?.();
    },
    onError: (error: any) => {
      console.error("Tulemuste salvestamine ebaõnnestus:", error);
      alert(`Viga salvestamisel: ${error.message}`);
    },
  });

  const approveResultsMutation = useMutation({
    mutationFn: async (rallyId: string) => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("Kasutaja pole autentitud");
      }

      // Verify rally exists and is completed
      const { data: rally, error: rallyError } = await supabase
        .from("rallies")
        .select("id, name, status")
        .eq("id", rallyId)
        .single();

      if (rallyError || !rally || rally.status !== "completed") {
        throw new Error("Rally peab olema lõppenud enne tulemuste kinnitamist");
      }

      // Check if there are results to approve
      const { data: allResults, error: resultsError } = await supabase
        .from("rally_results")
        .select("id, overall_position, total_points, extra_points")
        .eq("rally_id", rallyId);

      if (resultsError || !allResults || allResults.length === 0) {
        throw new Error("Rallis pole osalejaid");
      }

      const hasAnyResults = allResults.some(
        (result) =>
          result.overall_position !== null ||
          (result.total_points !== null && result.total_points > 0) ||
          (result.extra_points !== null && result.extra_points > 0)
      );

      if (!hasAnyResults) {
        throw new Error(
          "Tulemusi pole veel sisestatud. Sisestage enne kinnitamist vähemalt mõned tulemused."
        );
      }

      // FIXED: Check if record exists first, then update or insert accordingly
      const { data: existingStatus, error: checkError } = await supabase
        .from("rally_results_status")
        .select("rally_id")
        .eq("rally_id", rallyId)
        .maybeSingle();

      if (checkError && checkError.code !== "PGRST116") {
        throw new Error(`Error checking status: ${checkError.message}`);
      }

      const statusData = {
        results_approved: true,
        results_completed: true,
        approved_at: new Date().toISOString(),
        approved_by: user.id,
        updated_at: new Date().toISOString(),
      };

      if (existingStatus) {
        // Update existing record
        const { error: updateError } = await supabase
          .from("rally_results_status")
          .update(statusData)
          .eq("rally_id", rallyId);

        if (updateError) {
          throw new Error(`Kinnitamine ebaõnnestus: ${updateError.message}`);
        }
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from("rally_results_status")
          .insert({
            rally_id: rallyId,
            results_needed_since: new Date().toISOString(),
            ...statusData,
          });

        if (insertError) {
          throw new Error(`Kinnitamine ebaõnnestus: ${insertError.message}`);
        }
      }

      return true;
    },
    onSuccess: () => {
      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({
        queryKey: ["rally-results-status", rallyId],
      });
      queryClient.invalidateQueries({
        queryKey: resultsKeys.completed_rallies(),
      });
      queryClient.invalidateQueries({
        queryKey: [...resultsKeys.completed_rallies(), "approved"],
      });

      alert("Tulemused on edukalt kinnitatud!");
    },
    onError: (error: any) => {
      console.error("Tulemuste kinnitamine ebaõnnestus:", error);
      alert(`Kinnitamine ebaõnnestus: ${error.message}`);
    },
  });

  return {
    saveResultsMutation,
    approveResultsMutation,
  };
}

/**
 * Save results for registered users (from rally_registrations)
 */
async function saveRegisteredUserResults(
  rallyId: string,
  registrationData: any,
  participant: any,
  userId: string,
  currentTime: string
): Promise<void> {
  console.log("💾 Saving registered user results...");
  console.log("Registration data:", registrationData);

  // Get user's player name directly from users table
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("player_name")
    .eq("id", registrationData.user_id)
    .single();

  if (userError || !userData) {
    console.error("Failed to get user data:", userError);
    throw new Error("Failed to get user data for registration");
  }

  // Get class name from game_classes table
  const { data: classData, error: classError } = await supabase
    .from("game_classes")
    .select("name")
    .eq("id", registrationData.class_id)
    .single();

  if (classError || !classData) {
    console.error("Failed to get class data:", classError);
    throw new Error("Failed to get class data for registration");
  }

  const playerName = userData.player_name;
  const className = classData.name;

  console.log("Player name:", playerName);
  console.log("Class name:", className);

  // Check if rally_results record already exists for this user
  const { data: existingResult, error: existingError } = await supabase
    .from("rally_results")
    .select("id")
    .eq("rally_id", rallyId)
    .eq("user_id", registrationData.user_id)
    .maybeSingle();

  if (existingError) {
    throw new Error(
      `Error checking existing results: ${existingError.message}`
    );
  }

  const resultData = {
    rally_id: rallyId,
    user_id: registrationData.user_id,
    registration_id: registrationData.id,
    class_name: className,
    overall_position: participant.overallPosition,
    class_position: participant.classPosition,
    total_points: participant.totalPoints,
    extra_points: participant.extraPoints || 0,
    results_entered_by: userId,
    results_entered_at: currentTime,
    updated_at: currentTime,
  };

  console.log("Result data to save:", resultData);

  if (existingResult) {
    // Update existing record
    const { error: updateError } = await supabase
      .from("rally_results")
      .update(resultData)
      .eq("id", existingResult.id);

    if (updateError) {
      throw new Error(`Failed to update results: ${updateError.message}`);
    }
  } else {
    // Create new record
    const { error: insertError } = await supabase
      .from("rally_results")
      .insert(resultData);

    if (insertError) {
      throw new Error(`Failed to create results: ${insertError.message}`);
    }
  }
}

/**
 * Save results for manual participants (already in rally_results)
 */
async function saveManualParticipantResults(
  resultId: string,
  participant: any,
  userId: string,
  currentTime: string
): Promise<void> {
  console.log("💾 Saving manual participant results...");

  const { error: updateError } = await supabase
    .from("rally_results")
    .update({
      overall_position: participant.overallPosition,
      class_position: participant.classPosition,
      total_points: participant.totalPoints,
      extra_points: participant.extraPoints || 0,
      results_entered_by: userId,
      results_entered_at: currentTime,
      updated_at: currentTime,
    })
    .eq("id", resultId);

  if (updateError) {
    throw new Error(
      `Failed to update manual participant: ${updateError.message}`
    );
  }
}

/**
 * Update rally results status after saving - FIXED: Check first, then update/insert
 */
async function updateRallyResultsStatus(rallyId: string): Promise<void> {
  try {
    // Check if all participants have results
    const { data: allParticipants, error: participantsError } = await supabase
      .from("rally_results")
      .select("id, overall_position, total_points, extra_points")
      .eq("rally_id", rallyId);

    if (participantsError || !allParticipants) {
      return; // Don't fail the main save operation
    }

    const hasAllResults = allParticipants.every(
      (p) =>
        p.overall_position !== null ||
        p.total_points !== null || // Removed > 0 check
        p.extra_points !== null // Removed > 0 check
    );

    // Check if record exists
    const { data: existingStatus, error: checkError } = await supabase
      .from("rally_results_status")
      .select("rally_id")
      .eq("rally_id", rallyId)
      .maybeSingle();

    if (checkError && checkError.code !== "PGRST116") {
      console.warn("Error checking rally status:", checkError);
      return;
    }

    const statusData = {
      results_completed: hasAllResults,
      results_needed_since: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (existingStatus) {
      // Update existing record
      await supabase
        .from("rally_results_status")
        .update(statusData)
        .eq("rally_id", rallyId);
    } else {
      // Insert new record
      await supabase.from("rally_results_status").insert({
        rally_id: rallyId,
        results_approved: false, // Default to false
        ...statusData,
      });
    }
  } catch (error) {
    console.warn("Error updating rally results status:", error);
    // Don't throw - this shouldn't fail the main save operation
  }
}
