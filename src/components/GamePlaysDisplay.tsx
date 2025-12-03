'use client';

import { Play } from '@/src/types';
import { useMemo } from 'react';

interface GamePlaysDisplayProps {
  technicalFouls: Play[];
  flagrantFouls: Play[];
  regularFouls: Play[];
}

export default function GamePlaysDisplay({ 
  technicalFouls, 
  flagrantFouls, 
  regularFouls 
}: GamePlaysDisplayProps) {
  
  // Create deterministic sizing based on index for collage effect
  const playsWithLayout = useMemo(() => {
    // IMPORTANT: Put ALL flagrant fouls first (regardless of game time), then ALL technical fouls
    const majorFouls = [...flagrantFouls, ...technicalFouls];
    
    return {
      major: majorFouls.map((play, index) => ({
        ...play,
        // Alternate between large and medium sizes
        size: index % 2 === 0 ? 'large' : 'medium'
      })),
      regular: regularFouls.map((play, index) => ({
        ...play,
        // Cycle through small, medium, and regular sizes
        size: ['small', 'medium', 'regular'][index % 3]
      }))
    };
  }, [technicalFouls, flagrantFouls, regularFouls]);
  
  const getSizeClasses = (size: string) => {
    switch(size) {
      case 'large':
        return 'col-span-2 row-span-2'; // Takes up 2x2 space
      case 'medium':
        return 'col-span-1 row-span-2'; // Takes up 1x2 space
      case 'regular':
        return 'col-span-1 row-span-1'; // Takes up 1x1 space
      case 'small':
        return 'col-span-1 row-span-1'; // Takes up 1x1 space
      default:
        return 'col-span-1 row-span-1';
    }
  };
  
  const renderFoulVideo = (play: Play & { size: string }, inGrid = false) => {
    // Use visitor team video if available, otherwise home team video
    const videoUrl = play.teamVtmVideoUrl || play.teamHtmVideoUrl;
    
    if (!videoUrl) return null;
    
    return (
      <div 
        key={play.eventNum} 
        className={inGrid ? '' : 'w-full'}
      >
        <div className="h-full flex flex-col">
          <video 
            controls 
            className="w-full rounded-lg shadow-lg flex-1"
            preload="metadata"
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="mt-2 text-xs md:text-sm text-gray-600">
            <span className="font-semibold">{play.clock}</span> - {play.description}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="p-4 md:p-8">
      {/* Technical and Flagrant Fouls - Alternating Pattern */}
      {playsWithLayout.major.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl md:text-2xl font-bold mb-6 text-red-700">
            Technical & Flagrant Fouls
          </h2>
          
          <div className="space-y-6 md:space-y-8">
            {playsWithLayout.major.map((play, index) => {
              // Every 1st, 4th, 7th, 10th... (index 0, 3, 6, 9...) is full width
              const isFullWidth = index % 3 === 0;
              
              if (isFullWidth) {
                return (
                  <div key={play.eventNum} className="w-full">
                    {renderFoulVideo(play, false)}
                  </div>
                );
              }
              
              // Check if this is part of a pair (2nd/3rd, 5th/6th, 8th/9th...)
              const isFirstInPair = index % 3 === 1;
              const nextPlay = playsWithLayout.major[index + 1];
              
              if (isFirstInPair && nextPlay) {
                // Render this and next video side by side
                return (
                  <div key={`pair-${play.eventNum}`} className="grid grid-cols-2 gap-4 md:gap-6">
                    {renderFoulVideo(play, true)}
                    {renderFoulVideo(nextPlay, true)}
                  </div>
                );
              } else if (!isFirstInPair) {
                // This is the second in a pair, already rendered
                return null;
              } else {
                // Odd one out - render as full width
                return (
                  <div key={play.eventNum} className="w-full">
                    {renderFoulVideo(play, false)}
                  </div>
                );
              }
            })}
          </div>
        </div>
      )}
      
      {/* Regular Fouls - Denser Collage */}
      {playsWithLayout.regular.length > 0 && (
        <div>
          <h2 className="text-lg md:text-xl font-bold mb-6 text-gray-700">
            Personal & Shooting Fouls
          </h2>
          
          <div className="columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-4">
            {playsWithLayout.regular.map(play => renderFoulVideo(play))}
          </div>
        </div>
      )}
      
      {/* No fouls found message */}
      {playsWithLayout.major.length === 0 && playsWithLayout.regular.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No foul videos available for this game.</p>
        </div>
      )}
    </div>
  );
}
