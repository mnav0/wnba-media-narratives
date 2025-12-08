'use client';

import { useState, useMemo } from 'react';
import EntityList from '@/src/components/EntityList';
import HeadlinesDisplay from '@/src/components/HeadlinesDisplay';
import GameView from '@/src/components/GameView';
import VideosDisplay from '@/src/components/VideosDisplay';
import { Entity, Headline, VideoData } from '@/src/types';
import { analyzeHeadlines, TextAnalysisResult } from '@/src/lib/textAnalysis';

interface PlayerViewProps {
  playerEntities: Entity[];
  gameEntities: Entity[];
  headlinesArray: [number, Headline][];
  gameVideosMap: Record<string, VideoData>;
  playerVideosMap: Record<string, VideoData>;
  gameHeadlineCounts: Record<string, number>;
  playerHeadlineCounts: Record<string, number>;
}

export default function PlayerView({ 
  playerEntities, 
  gameEntities, 
  headlinesArray, 
  gameVideosMap, 
  playerVideosMap,
  gameHeadlineCounts,
  playerHeadlineCounts
}: PlayerViewProps) {
  const [viewMode, setViewMode] = useState<'players' | 'games'>('players');
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [allEntityHeadlines, setAllEntityHeadlines] = useState<Headline[]>([]);
  const [filteredHeadlines, setFilteredHeadlines] = useState<Headline[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'headlines' | 'videos'>('headlines');
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  
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
    setActiveTab('headlines');
    
    // Get all headlines for this entity
    const entityHeadlines: Headline[] = entity.matchedHeadlines
      .map(id => allHeadlines.get(id))
      .filter((h): h is Headline => h !== undefined);
    
    setAllEntityHeadlines(entityHeadlines);
    setFilteredHeadlines(entityHeadlines);
    
    // Load video data based on entity type
    if (entity.gameId) {
      const videos = gameVideosMap[entity.gameId] || null;
      setVideoData(videos);
    } else {
      const videos = playerVideosMap[entity.name] || null;
      setVideoData(videos);
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
    setActiveTab('headlines');
    setVideoData(null);
  };

  return (
    <>
      {selectedEntity ? (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          {/* Header with tabs */}
          <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-gray-200 z-10">
            <div className="p-4 flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-xl md:text-2xl font-bold mb-4">{selectedEntity.name}</h1>
                
                {/* Tab Navigation - only show Videos tab if data exists */}
                <div className="flex gap-4 border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab('headlines')}
                    className={`pb-2 px-1 font-semibold transition-colors relative ${
                      activeTab === 'headlines'
                        ? 'text-black'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    Headlines
                    {activeTab === 'headlines' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('videos')}
                    className={`pb-2 px-1 font-semibold transition-colors relative ${
                      activeTab === 'videos'
                        ? 'text-black'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    Videos
                    {activeTab === 'videos' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
                    )}
                  </button>
                </div>
              </div>
              
              <button 
                onClick={handleClose}
                className="text-2xl text-gray-400 hover:text-black transition-colors ml-4"
                aria-label="Close"
              >
                ×
              </button>
            </div>
          </div>
          
          {/* Content based on active tab */}
          {activeTab === 'headlines' ? (
            <>
              {/* Show text analysis in the tab area */}
              {textAnalysis && (
                <div className="px-4 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="space-y-3 text-sm">
                    <p className="text-gray-600">
                      {textAnalysis.totalHeadlines} headline{textAnalysis.totalHeadlines !== 1 ? 's' : ''}
                      {activeFilter && (
                        <span className="ml-2 text-blue-600">
                          (filtered by "{activeFilter}")
                        </span>
                      )}
                    </p>
                    
                    {textAnalysis.topWords.length > 0 && (
                      <div>
                        <p className="text-xs uppercase text-gray-400 mb-1">Most frequent words</p>
                        <div className="flex flex-wrap gap-2">
                          {textAnalysis.topWords.map(({ word, count }) => (
                            <button
                              key={word}
                              onClick={() => handleWordFilter(word)}
                              className={`px-2 py-1 rounded text-xs transition-colors ${
                                activeFilter === word
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                              }`}
                            >
                              {word} ({count})
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {textAnalysis.topAdjectives.length > 0 && (
                        <div>
                          <p className="text-xs uppercase text-gray-400 mb-1">Top adjectives</p>
                          <div className="flex flex-wrap gap-2">
                            {textAnalysis.topAdjectives.map(({ word, count }) => (
                              <button
                                key={word}
                                onClick={() => handleWordFilter(word)}
                                className={`px-2 py-1 rounded text-xs transition-colors ${
                                  activeFilter === word
                                    ? 'bg-green-600 text-white'
                                    : 'bg-green-50 hover:bg-green-100 text-green-700'
                                }`}
                              >
                                {word} ({count})
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {textAnalysis.topVerbs.length > 0 && (
                        <div>
                          <p className="text-xs uppercase text-gray-400 mb-1">Top verbs</p>
                          <div className="flex flex-wrap gap-2">
                            {textAnalysis.topVerbs.map(({ word, count }) => (
                              <button
                                key={word}
                                onClick={() => handleWordFilter(word)}
                                className={`px-2 py-1 rounded text-xs transition-colors ${
                                  activeFilter === word
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-purple-50 hover:bg-purple-100 text-purple-700'
                                }`}
                              >
                                {word} ({count})
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {textAnalysis.topPositiveWords.length > 0 && (
                        <div>
                          <p className="text-xs uppercase text-gray-400 mb-1">Most Positive Words</p>
                          <div className="flex flex-wrap gap-2">
                            {textAnalysis.topPositiveWords.map(({ word, count }) => (
                              <button
                                key={word}
                                onClick={() => handleWordFilter(word)}
                                className={`px-2 py-1 rounded text-xs transition-colors ${
                                  activeFilter === word
                                    ? 'bg-green-600 text-white'
                                    : 'bg-green-50 hover:bg-green-100 text-green-800'
                                }`}
                              >
                                {word} ({count})
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {textAnalysis.topNegativeWords.length > 0 && (
                        <div>
                          <p className="text-xs uppercase text-gray-400 mb-1">Most Negative Words</p>
                          <div className="flex flex-wrap gap-2">
                            {textAnalysis.topNegativeWords.map(({ word, count }) => (
                              <button
                                key={word}
                                onClick={() => handleWordFilter(word)}
                                className={`px-2 py-1 rounded text-xs transition-colors ${
                                  activeFilter === word
                                    ? 'bg-red-600 text-white'
                                    : 'bg-red-50 hover:bg-red-100 text-red-800'
                                }`}
                              >
                                {word} ({count})
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {textAnalysis.topPhrases.length > 0 && (
                      <div>
                        <p className="text-xs uppercase text-gray-400 mb-1">Top Phrases</p>
                        <div className="flex flex-wrap gap-2">
                          {textAnalysis.topPhrases.map(({ phrase, count }) => (
                            <button
                              key={phrase}
                              onClick={() => handleWordFilter(phrase)}
                              className={`px-2 py-1 rounded text-xs transition-colors ${
                                activeFilter === phrase
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                              }`}
                            >
                              {phrase} ({count})
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <HeadlinesDisplay
                headlines={filteredHeadlines}
                entityName={selectedEntity.name}
                textAnalysis={textAnalysis}
                activeFilter={activeFilter}
                onWordClick={handleWordFilter}
                onClose={handleClose}
                hideHeader={true}
              />
            </>
          ) : (
            <VideosDisplay
              videoData={videoData}
              entityName={selectedEntity.name}
              viewType={viewMode === 'players' ? 'player' : 'game'}
              gameHeadlineCounts={gameHeadlineCounts}
              playerHeadlineCounts={playerHeadlineCounts}
            />
          )}
        </div>
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
