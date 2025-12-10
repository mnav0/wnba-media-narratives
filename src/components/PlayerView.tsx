'use client';

import { useState, useMemo } from 'react';
import EntityList from '@/src/components/EntityList';
import HeadlinesDisplay from '@/src/components/HeadlinesDisplay';
import VideosDisplay from '@/src/components/VideosDisplay';
import { useState as useReactState } from 'react';
import { Entity, Headline, VideoData, FoulType } from '@/src/types';
import { analyzeHeadlines, TextAnalysisResult } from '@/src/lib/textAnalysis';

interface PlayerViewProps {
  playerEntities: Entity[];
  gameEntities: Entity[];
  headlinesArray: [number, Headline][];
  gameVideosMap: Record<string, VideoData>;
  playerVideosMap: Record<string, VideoData>;
  gameHeadlineCounts: Record<string, number>;
  playerHeadlineCounts: Record<string, number>;
  physicalityStatsMap: Record<string, any>;
  physicalityRankingsMap: Record<string, any[]>;
}

export default function PlayerView(props: PlayerViewProps) {
  const {
    playerEntities, 
    gameEntities, 
    headlinesArray, 
    gameVideosMap, 
    playerVideosMap,
    gameHeadlineCounts,
    playerHeadlineCounts,
    physicalityStatsMap,
    physicalityRankingsMap
  } = props;
  const [viewMode, setViewMode] = useState<'players' | 'games'>('players');
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [allEntityHeadlines, setAllEntityHeadlines] = useState<Headline[]>([]);
  const [filteredHeadlines, setFilteredHeadlines] = useState<Headline[]>([]);
  const [headlineIds, setHeadlineIds] = useState<number[]>([]);
  const [filteredHeadlineIds, setFilteredHeadlineIds] = useState<number[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'headlines' | 'videos'>('headlines');
  // For physicality stat dropdown in videos tab
  const [selectedStat, setSelectedStat] = useReactState<FoulType>('personal');
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  
  // Get current entities based on view mode
  const currentEntities = viewMode === 'players' ? playerEntities : gameEntities;
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(currentEntities.length / ITEMS_PER_PAGE);
  
  // Convert array back to Map
  const allHeadlines = new Map(headlinesArray);

  // Create date-based game headline count lookup
  const gameDateHeadlineCounts = useMemo(() => {
    const dateMap: Record<string, number> = {};
    gameEntities.forEach(game => {
      if (game.datetime) {
        // Use the datetime directly as key (should be YYYY-MM-DD format)
        dateMap[game.datetime] = game.headlineCount;
      }
    });
    return dateMap;
  }, [gameEntities]);

  // Create headline ID to max player headline count lookup
  // For game views, we want to scale headlines by the prominence of associated players
  const headlineToPlayerCounts = useMemo(() => {
    const map: Record<number, number> = {};
    playerEntities.forEach((player) => {
      player.matchedHeadlines.forEach((headlineId: number) => {
        // Store the max player headline count for each headline
        if (!map[headlineId] || player.headlineCount > map[headlineId]) {
          map[headlineId] = player.headlineCount;
        }
      });
    });
    return map;
  }, [playerEntities]);

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
    
    // Get all headlines for this entity, keeping track of IDs
    const validHeadlines: Headline[] = [];
    const validIds: number[] = [];
    
    entity.matchedHeadlines.forEach((id: number) => {
      const headline = allHeadlines.get(id);
      if (headline) {
        validHeadlines.push(headline);
        validIds.push(id);
      }
    });
    
    setAllEntityHeadlines(validHeadlines);
    setFilteredHeadlines(validHeadlines);
    setHeadlineIds(validIds);
    setFilteredHeadlineIds(validIds);
    
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
      setFilteredHeadlineIds(headlineIds);
    } else {
      // Apply filter
      setActiveFilter(word);
      const filtered: Headline[] = [];
      const filteredIds: number[] = [];
      
      allEntityHeadlines.forEach((h, index) => {
        const text = `${h.headline} ${h.summary || ''}`.toLowerCase();
        if (text.includes(word.toLowerCase())) {
          filtered.push(h);
          filteredIds.push(headlineIds[index]);
        }
      });
      
      setFilteredHeadlines(filtered);
      setFilteredHeadlineIds(filteredIds);
    }
  };

  const getPlayerRankSuffix = (rank: number): string => {
    const s = ["th", "st", "nd", "rd"];
    const v = rank % 100;
    return (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const handleClose = () => {
    setSelectedEntity(null);
    setAllEntityHeadlines([]);
    setFilteredHeadlines([]);
    setHeadlineIds([]);
    setFilteredHeadlineIds([]);
    setActiveFilter(null);
    setActiveTab('headlines');
    setVideoData(null);
  };

  return (
    <>
      {selectedEntity ? (
        <div className="fixed inset-0 bg-[#f5f1e8] z-50 overflow-y-auto">
          {/* Header with tabs */}
          <div className="sticky top-0 bg-[#f5f1e8]/95 backdrop-blur border-b border-black z-10">
            <div className="px-4 md:px-8 py-4 flex justify-between items-center">
              <div className="flex items-center gap-6">
                <h1 className="text-xl font-serif italic font-bold">{selectedEntity.name}</h1>
                
                {/* Tab Navigation inline with title */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('headlines')}
                    className={`px-4 py-2 border border-black font-semibold transition-colors text-sm ${
                      activeTab === 'headlines'
                        ? 'bg-black text-white'
                        : 'bg-[#f5f1e8] text-black hover:bg-black hover:text-white'
                    }`}
                  >
                    Headlines
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('videos')}
                    className={`px-4 py-2 border border-black font-semibold transition-colors text-sm ${
                      activeTab === 'videos'
                        ? 'bg-black text-white'
                        : 'bg-[#f5f1e8] text-black hover:bg-black hover:text-white'
                    }`}
                  >
                    Videos
                  </button>
                </div>
              </div>
              
              <button 
                onClick={handleClose}
                className="text-2xl text-black/60 hover:text-black transition-colors"
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
                <div className="px-4 md:px-8 py-4 border-b border-black bg-[#f5f1e8]">
                  <div className="space-y-3 text-sm">
                    <p className="text-black/70">
                      {textAnalysis.totalHeadlines} headline{textAnalysis.totalHeadlines !== 1 ? 's' : ''}
                      {activeFilter && (
                        <span className="ml-2 text-black font-semibold">
                          (filtered by "{activeFilter}")
                        </span>
                      )}
                    </p>
                    
                    {textAnalysis.topWords.length > 0 && (
                      <div>
                        <p className="text-xs uppercase text-black/50 mb-1">Most frequent words</p>
                        <div className="flex flex-wrap gap-2">
                          {textAnalysis.topWords.map(({ word, count }) => (
                            <button
                              key={word}
                              onClick={() => handleWordFilter(word)}
                              className={`px-2 py-1 border border-black text-xs transition-colors ${
                                activeFilter === word
                                  ? 'bg-black text-white'
                                  : 'text-black'
                              }`}
                              style={activeFilter !== word ? { backgroundColor: 'var(--color-neutral-light)', opacity: 0.7 } : undefined}
                              onMouseEnter={(e) => { if (activeFilter !== word) e.currentTarget.style.backgroundColor = 'transparent'; }}
                              onMouseLeave={(e) => { if (activeFilter !== word) e.currentTarget.style.backgroundColor = 'var(--color-neutral-light)'; }}
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
                          <p className="text-xs uppercase text-black/50 mb-1">Top adjectives</p>
                          <div className="flex flex-wrap gap-2">
                            {textAnalysis.topAdjectives.map(({ word, count }) => (
                              <button
                                key={word}
                                onClick={() => handleWordFilter(word)}
                                className={`px-2 py-1 border border-black text-xs transition-colors ${
                                  activeFilter === word
                                    ? 'bg-black text-white'
                                    : 'text-black'
                                }`}
                                style={activeFilter !== word ? { backgroundColor: 'var(--color-adjective-light)', opacity: 0.7 } : undefined}
                                onMouseEnter={(e) => { if (activeFilter !== word) e.currentTarget.style.backgroundColor = 'transparent'; }}
                                onMouseLeave={(e) => { if (activeFilter !== word) e.currentTarget.style.backgroundColor = 'var(--color-adjective-light)'; }}
                              >
                                {word} ({count})
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {textAnalysis.topVerbs.length > 0 && (
                        <div>
                          <p className="text-xs uppercase text-black/50 mb-1">Top verbs</p>
                          <div className="flex flex-wrap gap-2">
                            {textAnalysis.topVerbs.map(({ word, count }) => (
                              <button
                                key={word}
                                onClick={() => handleWordFilter(word)}
                                className={`px-2 py-1 border border-black text-xs transition-colors ${
                                  activeFilter === word
                                    ? 'bg-black text-white'
                                    : 'text-black'
                                }`}
                                style={activeFilter !== word ? { backgroundColor: 'var(--color-verb-light)', opacity: 0.7 } : undefined}
                                onMouseEnter={(e) => { if (activeFilter !== word) e.currentTarget.style.backgroundColor = 'transparent'; }}
                                onMouseLeave={(e) => { if (activeFilter !== word) e.currentTarget.style.backgroundColor = 'var(--color-verb-light)'; }}
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
                          <p className="text-xs uppercase text-black/50 mb-1">Most Positive Words</p>
                          <div className="flex flex-wrap gap-2">
                            {textAnalysis.topPositiveWords.map(({ word, count }) => (
                              <button
                                key={word}
                                onClick={() => handleWordFilter(word)}
                                className={`px-2 py-1 border border-black text-xs transition-colors ${
                                  activeFilter === word
                                    ? 'bg-black text-white'
                                    : 'text-black'
                                }`}
                                style={activeFilter !== word ? { backgroundColor: 'var(--color-positive-light)', opacity: 0.7 } : undefined}
                                onMouseEnter={(e) => { if (activeFilter !== word) e.currentTarget.style.backgroundColor = 'transparent'; }}
                                onMouseLeave={(e) => { if (activeFilter !== word) e.currentTarget.style.backgroundColor = 'var(--color-positive-light)'; }}
                              >
                                {word} ({count})
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {textAnalysis.topNegativeWords.length > 0 && (
                        <div>
                          <p className="text-xs uppercase text-black/50 mb-1">Most Negative Words</p>
                          <div className="flex flex-wrap gap-2">
                            {textAnalysis.topNegativeWords.map(({ word, count }) => (
                              <button
                                key={word}
                                onClick={() => handleWordFilter(word)}
                                className={`px-2 py-1 border border-black text-xs transition-colors ${
                                  activeFilter === word
                                    ? 'bg-black text-white'
                                    : 'text-black'
                                }`}
                                style={activeFilter !== word ? { backgroundColor: 'var(--color-negative-light)', opacity: 0.7 } : undefined}
                                onMouseEnter={(e) => { if (activeFilter !== word) e.currentTarget.style.backgroundColor = 'transparent'; }}
                                onMouseLeave={(e) => { if (activeFilter !== word) e.currentTarget.style.backgroundColor = 'var(--color-negative-light)'; }}
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
                        <p className="text-xs uppercase text-black/50 mb-1">Top Phrases</p>
                        <div className="flex flex-wrap gap-2">
                          {textAnalysis.topPhrases.map(({ phrase, count }) => (
                            <button
                              key={phrase}
                              onClick={() => handleWordFilter(phrase)}
                              className={`px-2 py-1 border border-black text-xs transition-colors ${
                                activeFilter === phrase
                                  ? 'bg-black text-white'
                                  : 'text-black'
                              }`}
                              style={activeFilter !== phrase ? { backgroundColor: 'var(--color-phrase-light)', opacity: 0.7 } : undefined}
                              onMouseEnter={(e) => { if (activeFilter !== phrase) e.currentTarget.style.backgroundColor = 'transparent'; }}
                              onMouseLeave={(e) => { if (activeFilter !== phrase) e.currentTarget.style.backgroundColor = 'var(--color-phrase-light)'; }}
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
                gameHeadlineCounts={gameDateHeadlineCounts}
                headlineToPlayerCounts={headlineToPlayerCounts}
                headlineIds={filteredHeadlineIds}
                isGameView={viewMode === 'games'}
              />
            </>
          ) : (
            <div>
              {(viewMode === 'players' && 
                <div className="flex flex-col md:flex-row md:items-center gap-2 py-4 px-4 md:px-8 border-b border-black">
                  <label htmlFor="stat-select" className="text-sm">
                    {(() => {
                      if (selectedEntity) {
                        const playerEntry = Object.values(physicalityStatsMap).find((s: any) => (s as any).name && (s as any).name.toLowerCase() === selectedEntity.name.toLowerCase()) as any;
                        if (playerEntry && playerEntry[selectedStat] !== null) {
                          const value = playerEntry[selectedStat] as number;
                          return (
                            <> averages
                            <span className="ml-2 text-sm font-semibold">{value.toFixed(5)}
                            </span>
                            </>
                          );
                        }
                      }
                      return null;
                    })()}
                  </label>
                  <select
                    id="stat-select"
                    value={selectedStat}
                    onChange={e => setSelectedStat(e.target.value as FoulType)}
                    className="border border-black rounded px-2 py-1 text-sm"
                  >
                    <option value="personal">personal fouls</option>
                    <option value="flagrant">flagrant fouls</option>
                    <option value="technical">technical fouls</option>
                    <option value="drawn">fouls drawn</option>
                  </select>
                  {(() => {
                    if (viewMode === 'players' && selectedEntity) {
                      // Try to match by name (case-insensitive)
                      const playerEntry = Object.values(physicalityStatsMap).find((s: any) => (s as any).name && (s as any).name.toLowerCase() === selectedEntity.name.toLowerCase()) as any;
                      if (playerEntry && playerEntry[selectedStat] !== null) {
                        const value = playerEntry[selectedStat] as number;
                        const rankings = physicalityRankingsMap[selectedStat] as any[];
                        const playerRank = rankings.find((r: any) => r.id === playerEntry.id);
                        return (
                          <span className="text-sm text-black/80"> per minute played.
                            {playerRank && value > 0 && (
                              <span className="ml-2">That's <span className="font-bold">{playerRank.rank}{getPlayerRankSuffix(playerRank.rank)}</span> in the league.</span>
                            )}
                          </span>
                        );
                      } 
                    }
                    return null;
                  })()}
                </div>
              )}
              <VideosDisplay
                videoData={videoData}
                entityName={selectedEntity.name}
                viewType={viewMode === 'players' ? 'player' : 'game'}
                gameHeadlineCounts={gameHeadlineCounts}
                playerHeadlineCounts={playerHeadlineCounts}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="relative h-screen">
          {/* Fixed Right Side Controls */}
          <div className="fixed top-8 right-8 z-10 flex flex-col gap-8 items-end">
            {/* Title */}
            <div className="text-right">
              <h1 className="text-6xl font-bold tracking-tight">WNBA</h1>
              <h2 className="text-5xl font-serif italic mt-1">Storylines</h2>
            </div>
            
            {/* View Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setViewMode('players');
                  setSelectedEntity(null);
                  setCurrentPage(0);
                }}
                className={`px-4 py-2 border border-black font-semibold transition-colors text-sm ${
                  viewMode === 'players'
                    ? 'bg-black text-white'
                    : 'bg-[#f5f1e8] text-black hover:bg-black hover:text-white'
                }`}
              >
                Players
              </button>
              <button
                onClick={() => {
                  setViewMode('games');
                  setSelectedEntity(null);
                  setCurrentPage(0);
                }}
                className={`px-4 py-2 border border-black font-semibold transition-colors text-sm ${
                  viewMode === 'games'
                    ? 'bg-black text-white'
                    : 'bg-[#f5f1e8] text-black hover:bg-black hover:text-white'
                }`}
              >
                Games
              </button>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  className="px-4 py-2 border border-black bg-[#f5f1e8] hover:bg-black hover:text-white disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[#f5f1e8] disabled:hover:text-black transition-colors text-sm"
                >
                  ←
                </button>
                <span className="text-sm">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="px-4 py-2 border border-black bg-[#f5f1e8] hover:bg-black hover:text-white disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[#f5f1e8] disabled:hover:text-black transition-colors text-sm"
                >
                  →
                </button>
              </div>
            )}
          </div>
          
          <EntityList
            entities={currentEntities}
            onEntityClick={handleEntityClick}
            selectedEntity={selectedEntity}
            currentPage={currentPage}
          />
        </div>
      )}
    </>
  );
}
