// src/components/championship/TeamChampionshipDetailsModal.tsx
"use client";

import { useState, useEffect } from "react";
import { useTeamChampionshipResults } from "@/hooks/useTeamChampionshipManagement";
import { supabase } from "@/lib/supabase";

interface TeamChampionshipDetailsModalProps {
  championshipId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const getPositionColor = (position: number) => {
  switch (position) {
    case 1:
      return "text-yellow-400";
    case 2:
      return "text-gray-300";
    case 3:
      return "text-orange-400";
    default:
      return "text-gray-400";
  }
};

const getPodiumIcon = (position: number) => {
  switch (position) {
    case 1:
      return "🥇";
    case 2:
      return "🥈";
    case 3:
      return "🥉";
    default:
      return null;
  }
};

export function TeamChampionshipDetailsModal({
  championshipId,
  onClose,
  onSuccess,
}: TeamChampionshipDetailsModalProps) {
  const [championship, setChampionship] = useState<any>(null);
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [teamResults, setTeamResults] = useState<any[]>([]);
  const [rallies, setRallies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChampionshipDetails();
    loadTeamChampionshipData();
  }, [championshipId]);

  const loadChampionshipDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("championships")
        .select(
          `
          *,
          game:games(name),
          game_type:game_types(name),
          championship_rallies(
            rally_id,
            round_number,
            rallies!inner(id, name, competition_date)
          )
        `
        )
        .eq("id", championshipId)
        .single();

      if (error) throw error;

      // Sort rallies by round number
      const sortedRallies =
        data.championship_rallies
          ?.sort((a: any, b: any) => a.round_number - b.round_number)
          .map((cr: any, index: number) => ({
            rally_id: cr.rally_id,
            rally_name: cr.rallies?.name || "Unknown Rally",
            etapp_number: index + 1,
          })) || [];

      setChampionship(data);
      setRallies(sortedRallies);
    } catch (error) {
      console.error("Error loading championship details:", error);
    }
  };

  const loadTeamChampionshipData = async () => {
    try {
      setIsLoading(true);

      // First get championship rallies
      const { data: championshipRallies, error: ralliesError } = await supabase
        .from("championship_rallies")
        .select("rally_id")
        .eq("championship_id", championshipId)
        .eq("is_active", true);

      if (ralliesError) throw ralliesError;

      const rallyIds = championshipRallies?.map((cr) => cr.rally_id) || [];

      if (rallyIds.length === 0) {
        setTeamResults([]);
        setIsLoading(false);
        return;
      }

      // Get team results for these rallies
      const { data: teamRallyResults, error: resultsError } = await supabase
        .from("team_rally_totals")
        .select(
          `
          team_id,
          team_name,
          class_name,
          rally_id,
          team_total_points
        `
        )
        .in("rally_id", rallyIds);

      if (resultsError) throw resultsError;

      // Group results by team
      const teamMap = new Map<string, any>();

      teamRallyResults?.forEach((result) => {
        const key = `${result.team_id}-${result.class_name}`;

        if (!teamMap.has(key)) {
          teamMap.set(key, {
            team_id: result.team_id,
            team_name: result.team_name,
            class_name: result.class_name,
            total_points: 0,
            rally_points: [],
          });
        }

        const team = teamMap.get(key);
        team.total_points += result.team_total_points || 0;
        team.rally_points.push({
          rally_id: result.rally_id,
          points: result.team_total_points || 0,
        });
      });

      // Convert to array and sort by total points
      const teams = Array.from(teamMap.values()).sort(
        (a, b) => b.total_points - a.total_points
      );

      setTeamResults(teams);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading team championship data:", error);
      setIsLoading(false);
    }
  };

  // Get unique classes from results
  const uniqueClasses = Array.from(
    new Set(teamResults.map((r) => r.class_name))
  ).sort();

  // Filter results by selected class
  const filteredResults =
    selectedClass === "all"
      ? teamResults
      : teamResults.filter((r) => r.class_name === selectedClass);

  // Sort filtered results by total points descending
  const sortedResults = [...filteredResults].sort(
    (a, b) => b.total_points - a.total_points
  );

  if (!championship) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-7xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 border-b border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {championship.name}
              </h2>
              <p className="text-slate-400 mt-1">
                Tiimide meistrivõistluse tulemused
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Championship Info */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center space-x-2 text-slate-300">
              <span>📅</span>
              <span>Hooaeg: {championship.season_year}</span>
            </div>
            {championship.game?.name && (
              <div className="flex items-center space-x-2 text-slate-300">
                <span>🎮</span>
                <span>{championship.game.name}</span>
              </div>
            )}
            <div className="flex items-center space-x-2 text-slate-300">
              <span>🏁</span>
              <span>Etappe: {rallies.length}</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <span>👥</span>
              <span>Tiime: {teamResults.length}</span>
            </div>
          </div>

          {/* Class Filter */}
          <div className="mt-4 flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedClass("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedClass === "all"
                  ? "bg-red-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              Kõik klassid ({teamResults.length})
            </button>
            {uniqueClasses.map((className) => (
              <button
                key={className}
                onClick={() => setSelectedClass(className)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedClass === className
                    ? "bg-red-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                {className} (
                {teamResults.filter((r) => r.class_name === className).length})
              </button>
            ))}
          </div>
        </div>

        {/* Results Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
          ) : sortedResults.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-slate-300 mb-2">
                Tulemusi ei leitud
              </h3>
              <p className="text-slate-400">
                See meistrivõistlus ei ole veel tulemusi
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-900/90 backdrop-blur z-10">
                  <tr className="border-b border-gray-700">
                    <th className="sticky left-0 z-20 bg-gray-900/90 px-3 py-3 text-left font-medium text-gray-300 border-r border-gray-600">
                      Koht
                    </th>
                    <th className="sticky left-[60px] z-20 bg-gray-900/90 px-3 py-3 text-left font-medium text-gray-300 border-r border-gray-600">
                      Tiimi nimi
                    </th>
                    <th className="px-3 py-3 text-left font-medium text-gray-300">
                      Klass
                    </th>

                    {/* Rally Headers */}
                    {rallies.map((rally) => (
                      <th
                        key={rally.rally_id}
                        className="px-2 py-3 text-center font-medium text-gray-300 min-w-[80px]"
                      >
                        <div className="flex flex-col">
                          <span className="text-xs">
                            Etapp {rally.etapp_number}
                          </span>
                        </div>
                      </th>
                    ))}

                    {/* Total Points */}
                    <th className="px-3 py-3 text-center font-medium text-gray-300 bg-red-500/10">
                      Kokku punktid
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {sortedResults.map((team, index) => {
                    const position = index + 1;
                    const positionColor = getPositionColor(position);
                    const icon = getPodiumIcon(position);

                    return (
                      <tr
                        key={team.team_id}
                        className={`border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${
                          position <= 3 ? "bg-gray-800/30" : ""
                        }`}
                      >
                        {/* Position */}
                        <td className="sticky left-0 z-10 bg-gray-800/20 px-3 py-2 border-r border-gray-600">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold ${positionColor}`}
                              style={{
                                fontSize: position <= 3 ? "1.1rem" : "0.9rem",
                              }}
                            >
                              {position}.
                            </span>
                            {icon && <span className="text-lg">{icon}</span>}
                          </div>
                        </td>

                        {/* Team Name */}
                        <td className="sticky left-[60px] z-10 bg-gray-800/20 px-3 py-2 border-r border-gray-600">
                          <span className="text-white font-medium">
                            {team.team_name}
                          </span>
                        </td>

                        {/* Class Name */}
                        <td className="px-3 py-2 text-gray-300 text-sm">
                          {team.class_name}
                        </td>

                        {/* Rally Points */}
                        {rallies.map((rally) => {
                          const rallyPoint = team.rally_points?.find(
                            (rp: any) => rp.rally_id === rally.rally_id
                          );

                          return (
                            <td
                              key={`${team.team_id}-${rally.rally_id}`}
                              className="px-2 py-2 text-center"
                            >
                              {rallyPoint && rallyPoint.points > 0 ? (
                                <span className="text-white font-medium text-sm">
                                  {rallyPoint.points}
                                </span>
                              ) : (
                                <span className="text-gray-500">-</span>
                              )}
                            </td>
                          );
                        })}

                        {/* Total Points */}
                        <td className="px-3 py-2 text-center bg-red-500/5">
                          <span className="text-red-400 font-bold text-lg">
                            {team.total_points}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-900 border-t border-slate-700 p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-slate-400">
              {championship.is_active ? (
                <span className="flex items-center text-green-400">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Aktiivne meistrivõistlus
                </span>
              ) : (
                <span className="flex items-center text-orange-400">
                  <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                  Ootab kinnitamist
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
            >
              Sulge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
