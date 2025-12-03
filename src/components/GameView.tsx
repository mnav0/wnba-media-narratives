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
}

export default function GameView({ 
  headlines, 
  entityName, 
  textAnalysis,
  activeFilter,
  onWordClick,
  onClose,
  gamePlaysData
}: GameViewProps) {
  const [activeTab, setActiveTab] = useState<'headlines' | 'plays'>('headlines');
  
  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      {/* Header with tabs */}
      <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-gray-200 z-10">
        <div className="p-4 flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold mb-4">{entityName}</h1>
            
            {/* Tab Navigation */}
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
                onClick={() => setActiveTab('plays')}
                className={`pb-2 px-1 font-semibold transition-colors relative ${
                  activeTab === 'plays'
                    ? 'text-black'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Game Plays
                {activeTab === 'plays' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
                )}
              </button>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-3xl leading-none hover:text-gray-600 transition-colors px-2 ml-4"
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
