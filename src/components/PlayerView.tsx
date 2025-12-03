'use client';

import { useState, useMemo } from 'react';
import EntityList from '@/src/components/EntityList';
import HeadlinesDisplay from '@/src/components/HeadlinesDisplay';
import GameView from '@/src/components/GameView';
import { Entity, Headline, GamePlaysData } from '@/src/types';
import { analyzeHeadlines, TextAnalysisResult } from '@/src/lib/textAnalysis';

interface PlayerViewProps {
  playerEntities: Entity[];
  gameEntities: Entity[];
  headlinesArray: [number, Headline][];
  gamePlaysMap: Record<string, GamePlaysData>;
}

export default function PlayerView({ playerEntities, gameEntities, headlinesArray, gamePlaysMap }: PlayerViewProps) {
  const [viewMode, setViewMode] = useState<'players' | 'games'>('players');
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [allEntityHeadlines, setAllEntityHeadlines] = useState<Headline[]>([]);
  const [filteredHeadlines, setFilteredHeadlines] = useState<Headline[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [gamePlaysData, setGamePlaysData] = useState<GamePlaysData | null>(null);
  
  // Get current entities based on view mode
  const currentEntities = viewMode === 'players' ? playerEntities : gameEntities;
  
  // Convert array back to Map
  const allHeadlines = new Map(headlinesArray);

  // Get all player names for text analysis (always use player names, even for games)
  const allPlayerNames = useMemo(() => playerEntities.map(e => e.name), [playerEntities]);

  // Analyze headlines when entity is selected
  const textAnalysis: TextAnalysisResult | null = useMemo(() => {
    if (!selectedEntity || allEntityHeadlines.length === 0) return null;
    return analyzeHeadlines(allEntityHeadlines, allPlayerNames);
  }, [selectedEntity, allEntityHeadlines, allPlayerNames]);

  const handleEntityClick = (entity: Entity) => {
    setSelectedEntity(entity);
    setActiveFilter(null);
    
    // Get all headlines for this entity
    const entityHeadlines: Headline[] = entity.matchedHeadlines
      .map(id => allHeadlines.get(id))
      .filter((h): h is Headline => h !== undefined);
    
    setAllEntityHeadlines(entityHeadlines);
    setFilteredHeadlines(entityHeadlines);
    
    // Load game plays data if this is a game entity
    if (entity.gameId) {
      const playsData = gamePlaysMap[entity.gameId] || null;
      setGamePlaysData(playsData);
    } else {
      setGamePlaysData(null);
    }
  };

  const handleWordFilter = (word: string) => {
    if (activeFilter === word) {
      // Remove filter
      setActiveFilter(null);
      setFilteredHeadlines(allEntityHeadlines);
    } else {
      // Apply filter
      setActiveFilter(word);
      const filtered = allEntityHeadlines.filter(h => {
        const text = `${h.headline} ${h.summary || ''}`.toLowerCase();
        return text.includes(word.toLowerCase());
      });
      setFilteredHeadlines(filtered);
    }
  };

  const handleClose = () => {
    setSelectedEntity(null);
    setAllEntityHeadlines([]);
    setFilteredHeadlines([]);
    setActiveFilter(null);
    setGamePlaysData(null);
  };

  const isGameEntity = selectedEntity?.gameId !== undefined;

  return (
    <>
      {selectedEntity ? (
        isGameEntity ? (
          <GameView
            headlines={filteredHeadlines}
            entityName={selectedEntity.name}
            textAnalysis={textAnalysis}
            activeFilter={activeFilter}
            onWordClick={handleWordFilter}
            onClose={handleClose}
            gamePlaysData={gamePlaysData}
          />
        ) : (
          <HeadlinesDisplay
            headlines={filteredHeadlines}
            entityName={selectedEntity.name}
            textAnalysis={textAnalysis}
            activeFilter={activeFilter}
            onWordClick={handleWordFilter}
            onClose={handleClose}
          />
        )
      ) : (
        <>
          {/* View Toggle */}
          <div className="flex justify-center gap-4 mb-8 pt-8">
            <button
              onClick={() => {
                setViewMode('players');
                setSelectedEntity(null);
              }}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                viewMode === 'players'
                  ? 'bg-black text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Players
            </button>
            <button
              onClick={() => {
                setViewMode('games');
                setSelectedEntity(null);
              }}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                viewMode === 'games'
                  ? 'bg-black text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Games
            </button>
          </div>
          
          <EntityList
            entities={currentEntities}
            onEntityClick={handleEntityClick}
            selectedEntity={selectedEntity}
          />
        </>
      )}
    </>
  );
}
