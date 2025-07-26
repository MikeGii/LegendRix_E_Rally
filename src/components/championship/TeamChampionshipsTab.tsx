// src/components/championship/TeamChampionshipsTab.tsx
"use client";

import { useState } from "react";
import { useTeamChampionships } from "@/hooks/useTeamChampionshipManagement";
import { CreateChampionshipModal } from "./CreateChampionshipModal";
import {
  useCompleteChampionship,
  useReopenChampionship,
} from "@/hooks/useChampionshipCompletion";
import { useActivateChampionship } from "@/hooks/useChampionshipManagement";
import { TeamChampionshipDetailsModal } from "./TeamChampionshipDetailsModal";

interface TeamChampionshipsTabProps {
  onOpenRallyModal?: (championship: { id: string; name: string }) => void;
}

export function TeamChampionshipsTab({
  onOpenRallyModal,
}: TeamChampionshipsTabProps = {}) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedChampionship, setSelectedChampionship] = useState<
    string | null
  >(null);
  const [statusActionChampionship, setStatusActionChampionship] = useState<
    string | null
  >(null);
  const [rallyModalChampionship, setRallyModalChampionship] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const {
    data: teamChampionships = [],
    isLoading,
    refetch,
  } = useTeamChampionships();
  const activateMutation = useActivateChampionship();
  const completeMutation = useCompleteChampionship();
  const reopenMutation = useReopenChampionship();

  const handleActivateChampionship = async (
    championshipId: string,
    championshipName: string
  ) => {
    const confirmed = confirm(
      `Kas oled kindel, et soovid kinnitada tiimide meistrivõistluse "${championshipName}" tulemused?\n\n` +
        `Pärast kinnitamist:\n` +
        `• Meistrivõistlus muutub avalikuks\n` +
        `• Tulemused ilmuvad Edetabelis\n` +
        `• Tulemusi ei saa enam muuta`
    );

    if (confirmed) {
      try {
        await activateMutation.mutateAsync(championshipId);
        alert("Tiimide meistrivõistluse tulemused on edukalt kinnitatud!");
        refetch();
      } catch (error) {
        console.error("Error activating championship:", error);
        alert("Viga kinnitamisel. Palun proovi uuesti.");
      }
    }
  };

  const handleCompleteChampionship = async (
    championshipId: string,
    championshipName: string
  ) => {
    const confirmed = confirm(
      `Kas oled kindel, et soovid märkida tiimide meistrivõistluse "${championshipName}" lõpetatuks?\n\n` +
        `Pärast lõpetamist:\n` +
        `• Meistrivõistlus muutub lõpetatuks\n` +
        `• Tiimid saavad vastavad saavutused\n` +
        `• Saad meistrivõistluse hiljem uuesti avada vajaduse korral`
    );

    if (confirmed) {
      setStatusActionChampionship(championshipId);
      try {
        const result = await completeMutation.mutateAsync(championshipId);
        if (result.success) {
          alert("Tiimide meistrivõistlus märgitud lõpetatuks!");
          refetch();
        } else {
          alert(result.error || "Viga meistrivõistluse lõpetamisel");
        }
      } catch (error) {
        console.error("Error completing championship:", error);
        alert("Viga meistrivõistluse lõpetamisel");
      } finally {
        setStatusActionChampionship(null);
      }
    }
  };

  const handleReopenChampionship = async (
    championshipId: string,
    championshipName: string
  ) => {
    const confirmed = confirm(
      `Kas oled kindel, et soovid avada tiimide meistrivõistluse "${championshipName}" uuesti?\n\n` +
        `Pärast avamist:\n` +
        `• Meistrivõistlus muutub taas aktiivseks\n` +
        `• Saad lisada uusi rallisid\n` +
        `• Saad hiljem uuesti lõpetatuks märkida`
    );

    if (confirmed) {
      setStatusActionChampionship(championshipId);
      try {
        const result = await reopenMutation.mutateAsync(championshipId);
        if (result.success) {
          alert("Tiimide meistrivõistlus avatud uuesti!");
          refetch();
        } else {
          alert(result.error || "Viga meistrivõistluse avamisel");
        }
      } catch (error) {
        console.error("Error reopening championship:", error);
        alert("Viga meistrivõistluse avamisel");
      } finally {
        setStatusActionChampionship(null);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("et-EE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCompletionDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("et-EE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">
              Tiimide meistrivõistluste nimekiri
            </h2>
            <div className="text-sm text-slate-400">
              Käimasolevad:{" "}
              {teamChampionships.filter((c) => c.status === "ongoing").length} •
              Lõpetatud:{" "}
              {teamChampionships.filter((c) => c.status === "completed").length}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8">
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-slate-700/30 rounded h-16"
                  ></div>
                ))}
              </div>
            </div>
          ) : teamChampionships.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Tiimide meistrivõistlusi pole veel loodud
              </h3>
              <p className="text-slate-400 mb-6">
                Alusta esimese tiimide meistrivõistluse loomisega
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                ➕ Loo esimene tiimide MV
              </button>
            </div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Meistrivõistlus
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Hooaeg
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Mäng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Rallide arv
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Aktiivsus
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Staatus
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Loodud
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Tegevused
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {teamChampionships.map((championship) => (
                  <tr
                    key={championship.id}
                    className="hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex-1">
                        <div className="font-medium text-white">
                          {championship.name}
                        </div>
                        {championship.description && (
                          <div className="mt-1">
                            <div className="text-sm text-slate-400 line-clamp-2">
                              {championship.description}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-slate-300">
                        {championship.season_year}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="text-white">
                          {championship.game_name || "Kõik mängud"}
                        </div>
                        {championship.game_type_name && (
                          <div className="text-slate-400">
                            {championship.game_type_name}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-300">
                          {championship.total_rallies || 0}
                        </span>
                        {(championship.total_rallies || 0) > 0 && (
                          <span className="text-slate-500">rallid</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {championship.is_active ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                          ✅ Aktiivne
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30">
                          ⏳ Ootab kinnitust
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <div
                          className={`
                          inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border w-fit
                          ${
                            championship.status === "completed"
                              ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                              : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                          }
                        `}
                        >
                          {championship.status === "completed"
                            ? "🏁 Lõpetatud"
                            : "🏃 Käimasolev"}
                        </div>

                        {championship.status === "completed" &&
                          championship.completed_at && (
                            <div className="text-xs text-slate-500">
                              {formatCompletionDate(championship.completed_at)}
                            </div>
                          )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-slate-400 text-sm">
                        {formatDate(championship.created_at)}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (onOpenRallyModal) {
                                onOpenRallyModal({
                                  id: championship.id,
                                  name: championship.name,
                                });
                              } else {
                                alert(
                                  "Rally modal functionality not implemented"
                                );
                              }
                            }}
                            className="px-3 py-1 text-sm bg-purple-600/20 text-purple-400 border border-purple-600/30 rounded hover:bg-purple-600/30 transition-colors"
                          >
                            Rallid
                          </button>
                          <button
                            onClick={() =>
                              setSelectedChampionship(championship.id)
                            }
                            className="px-3 py-1 text-sm bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded hover:bg-blue-600/30 transition-colors"
                          >
                            Halda
                          </button>

                          {!championship.is_active &&
                            (championship.total_rallies || 0) > 0 && (
                              <button
                                onClick={() =>
                                  handleActivateChampionship(
                                    championship.id,
                                    championship.name
                                  )
                                }
                                disabled={activateMutation.isPending}
                                className="px-3 py-1 text-sm bg-green-600/20 text-green-400 border border-green-600/30 rounded hover:bg-green-600/30 transition-colors disabled:opacity-50"
                              >
                                {activateMutation.isPending
                                  ? "Kinnitamine..."
                                  : "Kinnita tulemused"}
                              </button>
                            )}

                          {!championship.is_active &&
                            (championship.total_rallies || 0) === 0 && (
                              <span className="px-3 py-1 text-xs text-slate-500 bg-slate-700/20 rounded">
                                Pole rallisid
                              </span>
                            )}
                        </div>

                        {championship.is_active && (
                          <div className="flex items-center gap-2">
                            {championship.status === "ongoing" ? (
                              <button
                                onClick={() =>
                                  handleCompleteChampionship(
                                    championship.id,
                                    championship.name
                                  )
                                }
                                disabled={
                                  statusActionChampionship === championship.id
                                }
                                className="px-3 py-1 text-sm bg-purple-600/20 text-purple-400 border border-purple-600/30 rounded hover:bg-purple-600/30 transition-colors disabled:opacity-50"
                              >
                                {statusActionChampionship === championship.id
                                  ? "Lõpetamine..."
                                  : "🏁 Märgi lõpetatuks"}
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  handleReopenChampionship(
                                    championship.id,
                                    championship.name
                                  )
                                }
                                disabled={
                                  statusActionChampionship === championship.id
                                }
                                className="px-3 py-1 text-sm bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded hover:bg-blue-600/30 transition-colors disabled:opacity-50"
                              >
                                {statusActionChampionship === championship.id
                                  ? "Avamine..."
                                  : "🔄 Ava uuesti"}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {/* Create Championship Modal */}
      {isCreateModalOpen && (
        <CreateChampionshipModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            refetch();
          }}
          championshipType="team"
        />
      )}
      // At the bottom with other modals, add:
      {selectedChampionship && (
        <TeamChampionshipDetailsModal
          championshipId={selectedChampionship}
          onClose={() => setSelectedChampionship(null)}
          onSuccess={() => {
            setSelectedChampionship(null);
            refetch();
          }}
        />
      )}
    </>
  );
}
