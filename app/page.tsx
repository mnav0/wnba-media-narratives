import PlayerView from '@/src/components/PlayerView';
import { 
  getPlayerEntities, 
  getGameEntities, 
  getAllHeadlines, 
  getGameVideos, 
  getPlayerVideos,
  getGameHeadlineCounts,
  getPlayerHeadlineCounts
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
  
  // Load headline count maps for video scaling
  const gameHeadlineCounts = getGameHeadlineCounts();
  const playerHeadlineCounts = getPlayerHeadlineCounts();
  
  // Convert Maps to plain objects for client component serialization
  const gameHeadlineCountsObj = Object.fromEntries(gameHeadlineCounts);
  const playerHeadlineCountsObj = Object.fromEntries(playerHeadlineCounts);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-center">WNBA Media Narratives</h1>
        <p className="text-center text-gray-600 mt-2">Explore headlines by player or game</p>
      </header>
      
      <main className="py-8">
        <PlayerView 
          playerEntities={playerEntities} 
          gameEntities={gameEntities}
          headlinesArray={headlinesArray}
          gameVideosMap={gameVideosMap}
          playerVideosMap={playerVideosMap}
          gameHeadlineCounts={gameHeadlineCountsObj}
          playerHeadlineCounts={playerHeadlineCountsObj}
        />
      </main>
    </div>
  );
}
