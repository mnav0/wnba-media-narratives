'use client';

import { Headline } from '@/src/types';
import { useMemo } from 'react';
import { TextAnalysisResult } from '@/src/lib/textAnalysis';

interface HeadlinesDisplayProps {
  headlines: Headline[];
  entityName: string;
  textAnalysis: TextAnalysisResult | null;
  activeFilter: string | null;
  onWordClick: (word: string) => void;
  onClose: () => void;
  hideHeader?: boolean; // Optional prop to hide header when used in tabs
  gameHeadlineCounts?: Record<string, number>; // Map of game date to headline count
  headlineToPlayerCounts?: Record<number, number>; // Map of headline ID to max player headline count
  headlineIds?: number[]; // Headline IDs in same order as headlines array
  isGameView?: boolean; // True if viewing a game (scale by player counts), false for player view (scale by game counts)
}

export default function HeadlinesDisplay({ 
  headlines, 
  entityName, 
  textAnalysis,
  activeFilter,
  onWordClick,
  onClose,
  hideHeader = false,
  gameHeadlineCounts,
  headlineToPlayerCounts,
  headlineIds,
  isGameView = false
}: HeadlinesDisplayProps) {
  // Helper function to format source names
  const formatSource = (source: string): string => {
    return source
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Helper function to get game headline count by matching dates
  const getGameHeadlineCount = (headline: Headline): number | null => {
    if (!gameHeadlineCounts || !headline.datetime) return null;
    
    // Extract just the date part (YYYY-MM-DD)
    // Handle both "YYYY-MM-DD HH:MM:SS" and "YYYY-MM-DDTHH:MM:SS" formats
    const headlineDate = headline.datetime.split(' ')[0].split('T')[0];
    return gameHeadlineCounts[headlineDate] || null;
  };

  // Get font size based on game headline count (similar to video scaling)
  // More granular sizing on the lower end for better differentiation
  const getFontSize = (headlineCount: number | null): string => {
    if (headlineCount === null) {
      // No game match - use smallest
      return '1rem';
    }
    
    if (headlineCount >= 20) return '3.5rem';      // Lots of headlines
    if (headlineCount >= 15) return '3rem';        // Many headlines
    if (headlineCount >= 10) return '2.5rem';      // Medium-high headlines
    if (headlineCount >= 7) return '2rem';         // Medium headlines
    if (headlineCount >= 5) return '1.75rem';      // Some headlines
    if (headlineCount >= 3) return '1.5rem';       // Few headlines
    if (headlineCount >= 2) return '1.25rem';      // Very few headlines
    return '1rem';                                  // Minimal headlines
  };

  // Use game-based or player-based sizing and opacity with randomized order
  const headlinesWithLayout = useMemo(() => {
    // Shuffle headlines randomly, keeping track of original indices for ID lookup
    const indexedHeadlines = headlines.map((h, i) => ({ headline: h, originalIndex: i }));
    const shuffled = [...indexedHeadlines].sort(() => Math.random() - 0.5);
    
    const results = shuffled.map(({ headline, originalIndex }, index) => {
      let headlineCount: number | null = null;
      
      // For game views, use player headline counts; for player views, use game headline counts
      if (isGameView && headlineToPlayerCounts && headlineIds && headlineIds[originalIndex] !== undefined) {
        // Get the max player headline count for this headline
        headlineCount = headlineToPlayerCounts[headlineIds[originalIndex]] || null;
      } else {
        // Use game-based headline count (for player views)
        headlineCount = getGameHeadlineCount(headline);
      }
      
      const fontSize = getFontSize(headlineCount);
      
      return {
        ...headline,
        fontSize,
        formattedSource: formatSource(headline.source)
      };
    });
    
    return results;
  }, [headlines, gameHeadlineCounts, headlineToPlayerCounts, headlineIds, isGameView]);

  return (
    <div className={hideHeader ? "" : "fixed inset-0 bg-[#f5f1e8] z-50 overflow-y-auto"}>
      
      <div className="p-4 md:p-8">
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 md:gap-6">
          {headlinesWithLayout.map((item, index) => (
            <a
              key={index}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block mb-4 md:mb-6 break-inside-avoid hover:opacity-60 transition-opacity"
            >
              <h2 
                className="font-serif leading-tight text-black hover:text-black/80 transition-colors"
                style={{ fontSize: item.fontSize }}
              >
                {item.headline}
              </h2>
              
              {item.summary && (
                <p className="text-sm md:text-base text-black/70 mt-2 leading-relaxed">
                  {item.summary}
                </p>
              )}
              
              <div className="flex flex-wrap gap-2 text-xs text-black/50 mt-2">
                {item.formattedSource && (
                  <span className="font-medium">{item.formattedSource}</span>
                )}
                {item.datetime && (
                  <span>{new Date(item.datetime).toLocaleDateString()}</span>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
