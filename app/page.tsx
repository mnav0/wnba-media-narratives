import PlayerView from '@/src/components/PlayerView';
import { getPlayerEntities, getAllHeadlines } from '@/src/lib/data';

export default function Home() {
  const entities = getPlayerEntities();
  const allHeadlines = getAllHeadlines();
  
  // Convert Map to array for serialization
  const headlinesArray = Array.from(allHeadlines.entries());

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-center">WNBA Media Narratives</h1>
        <p className="text-center text-gray-600 mt-2">Click a player to explore their headlines</p>
      </header>
      
      <main className="py-8">
        <PlayerView entities={entities} headlinesArray={headlinesArray} />
      </main>
    </div>
  );
}
