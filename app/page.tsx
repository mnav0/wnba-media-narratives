import PlayerView from '@/src/components/PlayerView';
import { 
  getPlayerEntities, 
  getGameEntities, 
  getAllHeadlines, 
  getGameVideos, 
  getPlayerVideos,
  getGameHeadlineCounts,
  getPlayerHeadlineCounts,
  getMergedPhysicalityStats,
  getPhysicalityRankings
} from '@/src/lib/data';
import { VideoData } from '@/src/types';

export default function Home() {
  const playerEntities = getPlayerEntities();
  const gameEntities = getGameEntities();
  const allHeadlines = getAllHeadlines();
  
  // Convert Map to array for serialization
  const headlinesArray = Array.from(allHeadlines.entries());
  
  // Pre-load game videos data for all games
  const gameVideosMap: Record<string, VideoData> = {};
  gameEntities.forEach(game => {
    if (game.gameId) {
      const videosData = getGameVideos(game.gameId);
      if (videosData) {
        gameVideosMap[game.gameId] = videosData;
      }
    }
  });
  
  // Pre-load player videos data for all players
  const playerVideosMap: Record<string, VideoData> = {};
  playerEntities.forEach(player => {
    const videosData = getPlayerVideos(player.name);
    if (videosData) {
      playerVideosMap[player.name] = videosData;
    }
  });
  
  // Build physicality stats map and rankings map for all stat types
  const physicalityStatsMap = getMergedPhysicalityStats();
  const physicalityRankingsMap: Record<string, any[]> = {
    personal: getPhysicalityRankings('personal'),
    flagrant: getPhysicalityRankings('flagrant'),
    technical: getPhysicalityRankings('technical'),
    drawn: getPhysicalityRankings('drawn'),
  };

  const physicalityStatMeta = {
    personal: { label: 'personal fouls', per: 'minute played' },
    flagrant: { label: 'flagrant fouls', per: 'minute played' },
    technical: { label: 'technical fouls', per: 'minute played' },
    drawn: { label: 'fouls drawn', per: 'minute played' },
  };
  
  // Load headline count maps for video scaling
  const gameHeadlineCounts = getGameHeadlineCounts();
  const playerHeadlineCounts = getPlayerHeadlineCounts();
  
  // Convert Maps to plain objects for client component serialization
  const gameHeadlineCountsObj = Object.fromEntries(gameHeadlineCounts);
  const playerHeadlineCountsObj = Object.fromEntries(playerHeadlineCounts);

  return (
    <div className="min-h-screen bg-[#f5f1e8]">
      <main>
        <PlayerView 
          playerEntities={playerEntities} 
          gameEntities={gameEntities}
          headlinesArray={headlinesArray}
          gameVideosMap={gameVideosMap}
          playerVideosMap={playerVideosMap}
          gameHeadlineCounts={gameHeadlineCountsObj}
          playerHeadlineCounts={playerHeadlineCountsObj}
          physicalityStatsMap={physicalityStatsMap}
          physicalityRankingsMap={physicalityRankingsMap}
        />
      </main>
    </div>
  );
}
