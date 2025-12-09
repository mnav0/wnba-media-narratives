'use client';

import { VideoData, Video } from '@/src/types';

interface VideosDisplayProps {
  videoData: VideoData | null;
  entityName: string;
  viewType: 'player' | 'game'; // player view = scale by game headlines, game view = scale by player headlines
  gameHeadlineCounts: Record<string, number>;
  playerHeadlineCounts: Record<string, number>;
}

export default function VideosDisplay({ 
  videoData, 
  entityName, 
  viewType,
  gameHeadlineCounts,
  playerHeadlineCounts
}: VideosDisplayProps) {
  
  if (!videoData || videoData.videoCount === 0) {
    return (
      <div className="p-4 md:p-8">
        <div className="text-center py-12 text-black/60">
          <p className="text-lg">No foul videos available for {entityName}.</p>
        </div>
      </div>
    );
  }
  
  // Get headline count for a specific video based on view type
  const getHeadlineCount = (video: Video): number => {
    if (viewType === 'player') {
      // Player view: Scale by game headline count
      return gameHeadlineCounts[video.gameId] || 0;
    } else {
      // Game view: Scale by player headline count
      return playerHeadlineCounts[video.playerId || ''] || 0;
    }
  };
  
  // Get size class based on headline count
  // Using calc() to account for gap spacing
  const getVideoSizeClass = (headlineCount: number) => {
    if (headlineCount >= 20) {
      // Lots of headlines: 2 videos per row
      return 'w-full md:w-[calc(50%-0.5rem)]';
    } else if (headlineCount >= 10) {
      // Medium headlines: 3 videos per row
      return 'w-full md:w-[calc(33.333%-0.667rem)]';
    } else if (headlineCount >= 5) {
      // Some headlines: 4 videos per row
      return 'w-1/2 md:w-[calc(25%-0.75rem)]';
    } else if (headlineCount >= 2) {
      // Few headlines: 6 videos per row
      return 'w-1/3 md:w-[calc(16.666%-0.833rem)]';
    } else {
      // Very few or no headlines: 10 videos per row
      return 'w-1/4 md:w-[calc(10%-0.9rem)]';
    }
  };
  
  // Sort videos by headline count (descending) so larger videos appear first
  const sortedVideos = [...videoData.videos].sort((a, b) => {
    const countA = getHeadlineCount(a);
    const countB = getHeadlineCount(b);
    return countB - countA;
  });
  
  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-wrap gap-4">
        {sortedVideos.map((video, index) => {
          const headlineCount = getHeadlineCount(video);
          const sizeClass = getVideoSizeClass(headlineCount);
          
          return (
            <div key={index} className={`${sizeClass}`} style={{ flexShrink: 0 }}>
              <div className="h-full flex flex-col">
                <video 
                  controls 
                  className="w-full rounded-lg shadow-lg flex-1"
                  preload="metadata"
                >
                  <source src={video.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                {video.playDescription && (
                  <div className="mt-2 text-xs md:text-sm text-black/70">
                    {video.playDescription}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
