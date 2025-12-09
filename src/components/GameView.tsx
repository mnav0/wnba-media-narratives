'use client';

import { useState } from 'react';
import HeadlinesDisplay from './HeadlinesDisplay';
import GamePlaysDisplay from './GamePlaysDisplay';
import { Headline, GamePlaysData } from '@/src/types';
import { TextAnalysisResult } from '@/src/lib/textAnalysis';

interface GameViewProps {
  headlines: Headline[];
  entityName: string;
  textAnalysis: TextAnalysisResult | null;
  activeFilter: string | null;
  onWordClick: (word: string) => void;
  onClose: () => void;
  gamePlaysData: GamePlaysData | null;
  gameHeadlineCounts?: Record<string, number>;
  headlineToPlayerCounts?: Record<number, number>;
}

export default function GameView({ 
  headlines, 
  entityName, 
  textAnalysis,
  activeFilter,
  onWordClick,
  onClose,
  gamePlaysData,
  gameHeadlineCounts,
  headlineToPlayerCounts
}: GameViewProps) {
  const [activeTab, setActiveTab] = useState<'headlines' | 'plays'>('headlines');
  
  return (
    <div className="fixed inset-0 bg-[#f5f1e8] z-50 overflow-y-auto">
      {/* Header with tabs */}
      <div className="sticky top-0 bg-[#f5f1e8]/95 backdrop-blur border-b border-black z-10">
        <div className="px-4 md:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-serif italic font-bold">{entityName}</h1>
            
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
                onClick={() => setActiveTab('plays')}
                className={`px-4 py-2 border border-black font-semibold transition-colors text-sm ${
                  activeTab === 'plays'
                    ? 'bg-black text-white'
                    : 'bg-[#f5f1e8] text-black hover:bg-black hover:text-white'
                }`}
              >
                Game Plays
              </button>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-3xl leading-none text-black/60 hover:text-black transition-colors px-2 ml-4"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      </div>
      
      {/* Content based on active tab */}
      {activeTab === 'headlines' ? (
        <HeadlinesDisplay
          headlines={headlines}
          entityName={entityName}
          textAnalysis={textAnalysis}
          activeFilter={activeFilter}
          onWordClick={onWordClick}
          onClose={onClose}
          hideHeader={true}
          gameHeadlineCounts={gameHeadlineCounts}
          headlineToPlayerCounts={headlineToPlayerCounts}
          isGameView={true}
        />
      ) : (
        gamePlaysData && (
          <GamePlaysDisplay
            technicalFouls={gamePlaysData.technicalFouls}
            flagrantFouls={gamePlaysData.flagrantFouls}
            regularFouls={gamePlaysData.regularFouls}
          />
        )
      )}
    </div>
  );
}
