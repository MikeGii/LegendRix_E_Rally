// src/components/landing/EdetabelModal.tsx
"use client";

import { useState, useEffect } from "react";
import { usePublicApprovedRallies } from "@/hooks/useApprovedRallies";
import {
  usePublicChampionships,
  PublicChampionship,
} from "@/hooks/usePublicChampionships";
import { usePublicTeamChampionships } from "@/hooks/usePublicTeamChampionships";
import { RallyResultsModal } from "@/components/edetabel/RallyResultsModal";
import { ChampionshipResultsModal } from "@/components/edetabel/ChampionshipResultsModal";
import { TeamChampionshipResultsModal } from "./edetabel/TeamChampionshipResultsModal";
import { EdetabelModalHeader } from "./edetabel/EdetabelModalHeader";
import { RalliesListView } from "./edetabel/RalliesListView";
import { ChampionshipsListView } from "./edetabel/ChampionshipsListView";
import { TeamListView } from "./edetabel/TeamListView";
import { TeamChampionshipsListView } from "./edetabel/TeamChampionshipsListView";

interface EdetabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChampionshipModalToggle?: (isOpen: boolean) => void;
}

const RALLIES_PER_PAGE = 10;

export function EdetabelModal({
  isOpen,
  onClose,
  onChampionshipModalToggle,
}: EdetabelModalProps) {
  // FIX: Corrected useState syntax
  const [viewType, setViewType] = useState< 'rallies' | 'championships' | 'teams' | 'teamChampionships'>('rallies') ;
  const [selectedRallyId, setSelectedRallyId] = useState<string | null>(null);
  const [selectedChampionship, setSelectedChampionship] =
    useState<PublicChampionship | null>(null);
  const [selectedTeamChampionship, setSelectedTeamChampionship] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isChampionshipModalOpen, setIsChampionshipModalOpen] = useState(false);
  const [isTeamChampionshipModalOpen, setIsTeamChampionshipModalOpen] =
    useState(false);

  // Rally filters
  const [gameFilter, setGameFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "name" | "participants">(
    "date"
  );
  const [currentPage, setCurrentPage] = useState(1);

  // Data hooks
  const { data: publicRallies = [], isLoading } = usePublicApprovedRallies();
  const { data: publicChampionships = [], isLoading: isLoadingChampionships } =
    usePublicChampionships();
  const {
    data: publicTeamChampionships = [],
    isLoading: isLoadingTeamChampionships,
  } = usePublicTeamChampionships();

  // Handle modal lifecycle
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      return () => {
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter and sort rallies
  const filteredRallies = publicRallies
    .filter((rally) => {
      const matchesGame = !gameFilter || rally.game_name === gameFilter;
      const matchesSearch =
        !searchTerm ||
        rally.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rally.game_name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesGame && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return (
            new Date(b.competition_date).getTime() -
            new Date(a.competition_date).getTime()
          );
        case "name":
          return a.name.localeCompare(b.name);
        case "participants":
          return b.total_participants - a.total_participants;
        default:
          return 0;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredRallies.length / RALLIES_PER_PAGE);
  const paginatedRallies = filteredRallies.slice(
    (currentPage - 1) * RALLIES_PER_PAGE,
    currentPage * RALLIES_PER_PAGE
  );

  // Helpers
  const availableGames = Array.from(
    new Set(publicRallies.map((r) => r.game_name))
  ).sort();
  const selectedRally = publicRallies.find((r) => r.id === selectedRallyId);

  // Handlers
  const handleViewTypeChange = (
    type: "rallies" | "championships" | "teams" | "teamChampionships"
  ) => {
    setViewType(type);
    setCurrentPage(1);
  };

  const handleChampionshipClick = (championship: PublicChampionship) => {
    setSelectedChampionship(championship);
    setIsChampionshipModalOpen(true);
    onChampionshipModalToggle?.(true);
  };

  const handleChampionshipModalClose = () => {
    setIsChampionshipModalOpen(false);
    setSelectedChampionship(null);
    onChampionshipModalToggle?.(false);
  };

  // Team Championship handlers
  const handleTeamChampionshipClick = (teamChampionship: any) => {
    setSelectedTeamChampionship({
      id: teamChampionship.id,
      name: teamChampionship.name,
    });
    setIsTeamChampionshipModalOpen(true);
  };

  const handleTeamChampionshipModalClose = () => {
    setIsTeamChampionshipModalOpen(false);
    setSelectedTeamChampionship(null);
  };

  // FIX: Transform the public team championships data to match TeamChampionship interface
  // Only map properties that exist in PublicTeamChampionship
  const transformedTeamChampionships = publicTeamChampionships.map((tc) => ({
    id: tc.id,
    name: tc.name,
    season_year: tc.season_year,
    game_name: tc.game_name,
    total_teams: tc.total_teams || 0,
    is_active: true, // Default value since it's not in PublicTeamChampionship
    status: "ongoing" as "ongoing" | "completed", // Default value
  }));

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Container */}
        <div className="relative w-full max-w-7xl max-h-[80vh] flex">
          <div className="relative w-full tech-border rounded-2xl shadow-[0_0_50px_rgba(255,0,64,0.3)] bg-black/95 flex flex-col">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-20 w-12 h-12 flex items-center justify-center rounded-xl bg-red-600/20 border-2 border-red-500/50 text-red-400 hover:bg-red-600/30 hover:border-red-500 hover:text-red-300 transition-all duration-300 shadow-[0_0_20px_rgba(255,0,64,0.3)]"
            >
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-modal-scrollbar">
              {/* Header */}
              <EdetabelModalHeader
                viewType={viewType}
                onViewTypeChange={handleViewTypeChange}
                ralliesCount={publicRallies.length}
                championshipsCount={publicChampionships.length}
                teamChampionshipsCount={publicTeamChampionships.length}
                gameFilter={gameFilter}
                availableGames={availableGames}
                onGameFilterChange={(game) => {
                  setGameFilter(game);
                  setCurrentPage(1);
                }}
                sortBy={sortBy}
                onSortChange={setSortBy}
                searchTerm={searchTerm}
                onSearchChange={(term) => {
                  setSearchTerm(term);
                  setCurrentPage(1);
                }}
              />

              {/* Content */}
              <div className="p-6">
                {viewType === "rallies" ? (
                  <RalliesListView
                    rallies={paginatedRallies}
                    isLoading={isLoading}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    onRallyClick={setSelectedRallyId}
                  />
                ) : viewType === "championships" ? (
                  <ChampionshipsListView
                    championships={publicChampionships}
                    isLoading={isLoadingChampionships}
                    onChampionshipClick={handleChampionshipClick}
                  />
                ) : viewType === "teams" ? (
                  <TeamListView />
                ) : viewType === "teamChampionships" ? (
                  <TeamChampionshipsListView
                    teamChampionships={transformedTeamChampionships}
                    isLoading={isLoadingTeamChampionships}
                    onTeamChampionshipClick={handleTeamChampionshipClick}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedRally && (
        <RallyResultsModal
          isOpen={!!selectedRallyId}
          onClose={() => setSelectedRallyId(null)}
          rally={selectedRally}
        />
      )}

      {selectedChampionship && isChampionshipModalOpen && (
        <ChampionshipResultsModal
          isOpen={isChampionshipModalOpen}
          onClose={handleChampionshipModalClose}
          championshipId={selectedChampionship.id}
          championshipName={selectedChampionship.name}
        />
      )}

      {selectedTeamChampionship && isTeamChampionshipModalOpen && (
        <TeamChampionshipResultsModal
          isOpen={isTeamChampionshipModalOpen}
          onClose={handleTeamChampionshipModalClose}
          championshipId={selectedTeamChampionship.id}
          championshipName={selectedTeamChampionship.name}
        />
      )}
    </>
  );
}
