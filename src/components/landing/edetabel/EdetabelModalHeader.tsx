// src/components/landing/edetabel/EdetabelModalHeader.tsx
"use client";

interface EdetabelModalHeaderProps {
  viewType: "rallies" | "championships" | "teams" | "teamChampionships";
  onViewTypeChange: (
    type: "rallies" | "championships" | "teams" | "teamChampionships"
  ) => void;
  ralliesCount: number;
  championshipsCount: number;
  teamChampionshipsCount: number; // NEW
  // Rally filters
  gameFilter?: string;
  availableGames?: string[];
  onGameFilterChange?: (game: string) => void;
  sortBy?: "date" | "name" | "participants";
  onSortChange?: (sort: "date" | "name" | "participants") => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

export function EdetabelModalHeader({
  viewType,
  onViewTypeChange,
  ralliesCount,
  championshipsCount,
  teamChampionshipsCount, // NEW
  gameFilter = "",
  availableGames = [],
  onGameFilterChange,
  sortBy = "date",
  onSortChange,
  searchTerm = "",
  onSearchChange,
}: EdetabelModalHeaderProps) {
  return (
    <div className="sticky top-0 bg-black/95 backdrop-blur-xl border-b border-red-500/30 p-6 z-10">
      <div className="pr-16">
        <h2 className="text-3xl font-black text-white font-['Orbitron'] tracking-wider mb-1">
          <span className="text-red-500">EDETABEL</span>
        </h2>
        <p className="text-gray-400">
          {
            viewType === "rallies"
              ? "Avalikud ralli tulemused"
              : viewType === "championships"
              ? "Avalikud koondarvestuste tulemused"
              : viewType === "teams"
              ? "Tiimide edetabel"
              : "Tiimide koondarvestused" // NEW
          }
        </p>
      </div>

      {/* View Type Toggle */}
      <div className="mt-4">
        <div className="flex bg-gray-900/50 rounded-xl p-1 border border-gray-800 overflow-x-auto">
          <button
            onClick={() => onViewTypeChange("rallies")}
            className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-['Orbitron'] uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
              viewType === "rallies"
                ? "bg-red-600/20 text-red-400 border border-red-500/50"
                : "text-gray-400 hover:text-red-400/70"
            }`}
          >
            🏁 Rallid ({ralliesCount})
          </button>
          <button
            onClick={() => onViewTypeChange("championships")}
            className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-['Orbitron'] uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
              viewType === "championships"
                ? "bg-red-600/20 text-red-400 border border-red-500/50"
                : "text-gray-400 hover:text-red-400/70"
            }`}
          >
            🏆 Koondarvestused ({championshipsCount})
          </button>
          <button
            onClick={() => onViewTypeChange("teams")}
            className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-['Orbitron'] uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
              viewType === "teams"
                ? "bg-red-600/20 text-red-400 border border-red-500/50"
                : "text-gray-400 hover:text-red-400/70"
            }`}
          >
            👥 Tiimid
          </button>
          <button
            onClick={() => onViewTypeChange("teamChampionships")}
            className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-['Orbitron'] uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
              viewType === "teamChampionships"
                ? "bg-red-600/20 text-red-400 border border-red-500/50"
                : "text-gray-400 hover:text-red-400/70"
            }`}
          >
            🏆👥 Tiimide koondarvestused ({teamChampionshipsCount})
          </button>
        </div>
      </div>

      {/* Filters for rallies */}
      {viewType === "rallies" && (
        <div className="flex flex-wrap gap-2">
          {/* Game filter */}
          <select
            value={gameFilter}
            onChange={(e) => onGameFilterChange?.(e.target.value)}
            className="px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-red-500/50 transition-colors"
          >
            <option value="">Kõik mängud</option>
            {availableGames.map((game) => (
              <option key={game} value={game}>
                {game}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) =>
              onSortChange?.(e.target.value as "date" | "name" | "participants")
            }
            className="px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-red-500/50 transition-colors"
          >
            <option value="date">Kuupäev</option>
            <option value="name">Nimi</option>
            <option value="participants">Osalejad</option>
          </select>

          {/* Search */}
          <input
            type="text"
            placeholder="Otsi..."
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-gray-300 text-sm placeholder-gray-500 focus:outline-none focus:border-red-500/50 transition-colors"
          />
        </div>
      )}
    </div>
  );
}
