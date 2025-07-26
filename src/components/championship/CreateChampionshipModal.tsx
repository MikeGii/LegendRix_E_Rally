// src/components/championship/CreateChampionshipModal.tsx
"use client";

import { useState, useEffect } from "react";
import {
  useCreateChampionship,
  useAddRallyToChampionship,
  Championship,
} from "@/hooks/useChampionshipManagement";
import { useCreateTeamChampionship } from "@/hooks/useTeamChampionshipManagement";
import { useApprovedRallies } from "@/hooks/useApprovedRallies";
import { useGames, useGameTypes } from "@/hooks/useGameManagement";

interface CreateChampionshipModalProps {
  championship?: Championship | null;
  onClose: () => void;
  onSuccess: () => void;
  championshipType?: "individual" | "team"; // ADD THIS
  isOpen?: boolean; // ADD THIS
}

export function CreateChampionshipModal({
  championship,
  onClose,
  onSuccess,
  championshipType = "individual", // ADD DEFAULT
  isOpen = true, // ADD DEFAULT
}: CreateChampionshipModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    season_year: new Date().getFullYear(),
    game_id: "",
    game_type_id: "",
  });
  const [selectedRallies, setSelectedRallies] = useState<string[]>([]);

  // Load edit data
  useEffect(() => {
    if (championship) {
      setFormData({
        name: championship.name,
        description: championship.description || "",
        season_year: championship.season_year || new Date().getFullYear(),
        game_id: championship.game_id || "",
        game_type_id: championship.game_type_id || "",
      });
    }
  }, [championship]);

  // Data hooks
  const { data: games = [] } = useGames();
  const { data: gameTypes = [] } = useGameTypes(formData.game_id);
  const { data: approvedRallies = [] } = useApprovedRallies();

  // Mutations - use appropriate one based on championship type
  const createChampionshipMutation = useCreateChampionship();
  const createTeamChampionshipMutation = useCreateTeamChampionship();
  const addRallyMutation = useAddRallyToChampionship();

  // Filter rallies by selected game if specified
  const selectedGameName = games.find((g) => g.id === formData.game_id)?.name;
  const filteredRallies = selectedGameName
    ? approvedRallies.filter((rally) => rally.game_name === selectedGameName)
    : approvedRallies;

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Reset game_type when game changes
    if (field === "game_id") {
      setFormData((prev) => ({
        ...prev,
        game_type_id: "",
      }));
    }
  };

  const handleRallyToggle = (rallyId: string) => {
    setSelectedRallies((prev) =>
      prev.includes(rallyId)
        ? prev.filter((id) => id !== rallyId)
        : [...prev, rallyId]
    );
  };

  const handleSave = async () => {
    try {
      // Step 1: Create championship (individual or team based on prop)
      console.log(`🔄 Creating ${championshipType} championship...`, formData);

      const newChampionship =
        championshipType === "team"
          ? await createTeamChampionshipMutation.mutateAsync(formData)
          : await createChampionshipMutation.mutateAsync({
              ...formData,
              championship_type: "individual", // ADD THIS - explicitly set championship_type
            });

      // Step 2: Add selected rallies
      if (selectedRallies.length > 0) {
        console.log("🔄 Adding rallies to championship...", selectedRallies);

        for (let i = 0; i < selectedRallies.length; i++) {
          const rallyId = selectedRallies[i];
          await addRallyMutation.mutateAsync({
            championship_id: newChampionship.id,
            rally_id: rallyId,
            round_number: i + 1,
            round_name: `${i + 1}. ring`,
          });
        }
      }

      console.log("✅ Championship created successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to create championship:", error);
      alert("Meistrivõistluse loomine ebaõnnestus. Palun proovi uuesti.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("et-EE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const isStep1Valid = formData.name.trim().length > 0;
  const isStep2Valid = selectedRallies.length > 0;
  const isLoading =
    createChampionshipMutation.isPending ||
    createTeamChampionshipMutation.isPending ||
    addRallyMutation.isPending;

  // Don't render if not open
  if (!isOpen) return null;

  // Get appropriate title based on championship type
  const getTitle = () => {
    if (championship) {
      return "Muuda meistrivõistlust";
    }
    return championshipType === "team"
      ? "Loo uus tiimide meistrivõistlus"
      : "Loo uus meistrivõistlus";
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl border border-slate-700/50 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{getTitle()}</h2>
              <p className="text-slate-400 mt-1">
                {currentStep === 1
                  ? "Sisesta meistrivõistluse andmed"
                  : "Vali rallid ja määra järjekord"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center space-x-4 mt-6">
            <div
              className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                currentStep === 1
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "bg-green-500/20 text-green-400 border border-green-500/30"
              }`}
            >
              <span>{currentStep === 1 ? "1" : "✓"}</span>
              <span>Põhiandmed</span>
            </div>
            <div
              className={`w-8 h-0.5 ${
                currentStep === 2 ? "bg-blue-500" : "bg-slate-600"
              }`}
            ></div>
            <div
              className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                currentStep === 2
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "bg-slate-600/20 text-slate-500 border border-slate-600/30"
              }`}
            >
              <span>2</span>
              <span>Rallid</span>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        {currentStep === 1 && (
          <div className="p-6 space-y-6">
            {/* Championship Type Indicator for Team Championships */}
            {championshipType === "team" && (
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <span className="text-purple-400 text-lg">👥</span>
                  <div>
                    <h4 className="text-purple-400 font-medium">
                      Tiimide meistrivõistlus
                    </h4>
                    <p className="text-purple-300/80 text-sm mt-1">
                      Loote tiimide meistrivõistlust, kus punkte koguvad tiimid,
                      mitte individuaalsed võistlejad.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Championship Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Meistrivõistluse nimi *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder={
                  championshipType === "team"
                    ? "nt. Eesti Tiimide Meistrivõistlused 2025"
                    : "nt. Eesti Ralliautode Meistrivõistlused 2025"
                }
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Kirjeldus
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Meistrivõistluse kirjeldus ja täiendav informatsioon..."
                rows={3}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Season Year */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Hooaeg
              </label>
              <input
                type="number"
                value={formData.season_year}
                onChange={(e) =>
                  handleInputChange(
                    "season_year",
                    parseInt(e.target.value) || new Date().getFullYear()
                  )
                }
                min="2020"
                max="2030"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Game Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Mäng (valikuline)
                </label>
                <select
                  value={formData.game_id}
                  onChange={(e) => handleInputChange("game_id", e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Kõik mängud</option>
                  {games.map((game) => (
                    <option key={game.id} value={game.id}>
                      {game.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Mängu tüüp (valikuline)
                </label>
                <select
                  value={formData.game_type_id}
                  onChange={(e) =>
                    handleInputChange("game_type_id", e.target.value)
                  }
                  disabled={!formData.game_id}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Kõik tüübid</option>
                  {gameTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 1 Actions */}
            <div className="flex justify-between pt-4">
              <button
                onClick={onClose}
                className="px-6 py-3 text-slate-400 hover:text-white transition-colors"
              >
                Tühista
              </button>
              <button
                onClick={() => setCurrentStep(2)}
                disabled={!isStep1Valid}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
              >
                Järgmine →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Rally Selection */}
        {currentStep === 2 && (
          <div className="p-6 space-y-6">
            {/* Info */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <span className="text-blue-400 text-lg">ℹ️</span>
                <div>
                  <h4 className="text-blue-400 font-medium">
                    Rallide valimine
                  </h4>
                  <p className="text-blue-300/80 text-sm mt-1">
                    Vali kinnitatud tulemustega rallid, mida soovid
                    meistrivõistlustesse kaasata. Rallid lisatakse valitud
                    järjekorras (1. ring, 2. ring jne).
                  </p>
                </div>
              </div>
            </div>

            {/* Rally Filter Info */}
            {formData.game_id && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-400">🎮</span>
                  <span className="text-yellow-400 text-sm">
                    Näidatakse ainult "
                    {games.find((g) => g.id === formData.game_id)?.name}" mängu
                    rallisid
                  </span>
                </div>
              </div>
            )}

            {/* Rally Selection */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Saadaolevad rallid ({filteredRallies.length})
              </h3>

              {filteredRallies.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏁</div>
                  <h3 className="text-xl font-semibold text-slate-300 mb-2">
                    Rallisid ei leitud
                  </h3>
                  <p className="text-slate-400">
                    {formData.game_id
                      ? "Selle mängu jaoks pole kinnitatud tulemustega rallisid"
                      : "Pole ühtegi kinnitatud tulemustega ralli"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredRallies.map((rally) => (
                    <div
                      key={rally.id}
                      className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedRallies.includes(rally.id)
                          ? "bg-blue-500/20 border-blue-500/50 ring-2 ring-blue-500/30"
                          : "bg-slate-700/30 border-slate-600 hover:bg-slate-700/50 hover:border-slate-500"
                      }`}
                      onClick={() => handleRallyToggle(rally.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-white mb-1">
                            {rally.name}
                          </h4>
                          <div className="text-sm text-slate-400 space-y-1">
                            <p>📅 {formatDate(rally.competition_date)}</p>
                            <p>
                              🎮 {rally.game_name} - {rally.game_type_name}
                            </p>
                            <p>👥 {rally.total_participants} osalejat</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {selectedRallies.includes(rally.id) && (
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                              {selectedRallies.indexOf(rally.id) + 1}. ring
                            </span>
                          )}
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              selectedRallies.includes(rally.id)
                                ? "bg-blue-500 border-blue-500 text-white"
                                : "border-slate-500"
                            }`}
                          >
                            {selectedRallies.includes(rally.id) && "✓"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Summary */}
            {selectedRallies.length > 0 && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <h4 className="text-green-400 font-medium mb-2">
                  Valitud rallid ({selectedRallies.length})
                </h4>
                <div className="text-sm text-green-300/80">
                  {selectedRallies.map((rallyId, index) => {
                    const rally = filteredRallies.find((r) => r.id === rallyId);
                    return rally ? (
                      <span key={rallyId}>
                        {index + 1}. ring: {rally.name}
                        {index < selectedRallies.length - 1 ? ", " : ""}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* Step 2 Actions */}
            <div className="flex justify-between pt-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-3 text-slate-400 hover:text-white transition-colors"
              >
                ← Tagasi
              </button>
              <button
                onClick={handleSave}
                disabled={!isStep2Valid || isLoading}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
              >
                {isLoading ? "Salvestamine..." : "Loo meistrivõistlus"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
