import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { Entity, Headline, Game, VideoData } from '@/src/types';

export function getPlayerEntities(): Entity[] {
  const csvPath = path.join(process.cwd(), 'src', 'data', 'player-headlines.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true
  });
  
  const entities: Entity[] = records.map((record: any) => {
    // Parse the matched_headlines array - it's a JSON array string
    const matchedHeadlines = JSON.parse(record.matched_headlines);
    
    return {
      name: record.full_name,
      headlineCount: matchedHeadlines.length,
      matchedHeadlines: matchedHeadlines
    };
  }).sort((a, b) => b.headlineCount - a.headlineCount);
  
  return entities;
}

export function getAllHeadlines(): Map<number, Headline> {
  const csvPath = path.join(process.cwd(), 'src', 'data', 'all-headlines-with-index.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true
  });
  
  const headlines = new Map<number, Headline>();
  
  records.forEach((record: any) => {
    // The first column (unnamed in header) contains the index
    const index = parseInt(record[''], 10);
    
    if (!isNaN(index)) {
      headlines.set(index, {
        link: record.link || '',
        headline: record.headline || '',
        datetime: record.datetime || '',
        source: record.source || '',
        summary: record.summary || '',
        authors: record.authors || '',
        image_desc: record.image_desc || ''
      });
    }
  });
  
  return headlines;
}

export function getGameEntities(): Entity[] {
  const csvPath = path.join(process.cwd(), 'src', 'data', 'game-headlines.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true
  });
  
  const entities: Entity[] = records.map((record: any) => {
    // Parse the headline_ids array
    const headlineIds = JSON.parse(record.headline_ids);
    const datetime = record.datetime;
    
    // Parse date as local time to avoid timezone shift
    // Split the date string and create Date object with local timezone
    const [year, month, day] = datetime.split('-').map(Number);
    const localDate = new Date(year, month - 1, day); // month is 0-indexed
    const date = localDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    return {
      name: `${record.away_team} @ ${record.home_team}`,
      headlineCount: headlineIds.length,
      matchedHeadlines: headlineIds,
      homeTeam: record.home_team,
      awayTeam: record.away_team,
      date: date,
      gameId: record.id,
      datetime: datetime // Store for sorting
    };
  }).sort((a, b) => {
    // Sort by headline count (descending) - same as players
    return b.headlineCount - a.headlineCount;
  });
  
  return entities;
}

export function getGameVideos(gameId: string): VideoData | null {
  const csvPath = path.join(process.cwd(), 'src', 'data', 'game-videos.csv');
  
  try {
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true
    }) as any[];
    
    // Find the record for this game
    const gameRecord: any = records.find((record: any) => record.game_id === gameId);
    
    if (!gameRecord || !gameRecord.players) {
      return null;
    }
    
    // Parse the nested players dictionary from the CSV
    // Format: {player_id: [video_urls]} - Python dict syntax
    // Remove outer quotes that CSV parser may include
    let playersString = gameRecord.players;
    if (playersString.startsWith('"') && playersString.endsWith('"')) {
      playersString = playersString.slice(1, -1);
    }
    
    // Convert Python dict syntax to JSON:
    // 1. Replace single quotes with double quotes
    // 2. Add quotes around numeric keys
    playersString = playersString
      .replace(/'/g, '"')
      .replace(/(\{|,\s*)(\d+):/g, '$1"$2":');
    
    const playersData = JSON.parse(playersString);
    
    // Extract all videos with their player IDs
    const videos: any[] = [];
    
    Object.entries(playersData).forEach(([playerId, videoUrls]: [string, any]) => {
      (videoUrls as string[]).forEach((url: string) => {
        videos.push({
          videoUrl: url,
          playDescription: '', // Game videos don't have play descriptions in the CSV
          gameId: gameId,
          playerId: playerId
        });
      });
    });
    
    return {
      videos,
      videoCount: videos.length
    };
  } catch (error) {
    // Silently return null for games without videos - this is expected
    return null;
  }
}

export function getPlayerVideos(playerName: string): VideoData | null {
  const csvPath = path.join(process.cwd(), 'src', 'data', 'player-videos.csv');
  
  try {
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true
    }) as any[];
    
    // Find the record for this player
    const playerRecord: any = records.find((record: any) => 
      record.full_name && record.full_name.toLowerCase() === playerName.toLowerCase()
    );
    
    if (!playerRecord || !playerRecord.games) {
      return null;
    }
    
    // Parse the nested games dictionary from the CSV
    // Format: {game_id: [video_urls]} - Python dict syntax
    // Remove outer quotes that CSV parser may include
    let gamesString = playerRecord.games;
    if (gamesString.startsWith('"') && gamesString.endsWith('"')) {
      gamesString = gamesString.slice(1, -1);
    }
    
    // Convert Python dict syntax to JSON:
    // 1. Replace single quotes with double quotes
    // 2. Add quotes around numeric keys
    gamesString = gamesString
      .replace(/'/g, '"')
      .replace(/(\{|,\s*)(\d+):/g, '$1"$2":');
    
    const gamesData = JSON.parse(gamesString);
    
    // Extract all videos with their game IDs
    const videos: any[] = [];
    
    Object.entries(gamesData).forEach(([gameId, videoUrls]: [string, any]) => {
      (videoUrls as string[]).forEach((url: string) => {
        videos.push({
          videoUrl: url,
          playDescription: '', // Player videos don't have play descriptions in the CSV
          gameId: gameId,
          playerId: playerRecord.player_id
        });
      });
    });
    
    return {
      videos,
      videoCount: videos.length
    };
  } catch (error) {
    return null;
  }
}

// Get all game headline counts as a map
export function getGameHeadlineCounts(): Map<string, number> {
  const csvPath = path.join(process.cwd(), 'src', 'data', 'game-headlines.csv');
  
  try {
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true
    });
    
    const headlineCounts = new Map<string, number>();
    
    records.forEach((record: any) => {
      headlineCounts.set(record.id, parseInt(record.headline_count) || 0);
    });
    
    return headlineCounts;
  } catch (error) {
    return new Map();
  }
}

// Get all player headline counts as a map
export function getPlayerHeadlineCounts(): Map<string, number> {
  const csvPath = path.join(process.cwd(), 'src', 'data', 'player-headlines.csv');
  
  try {
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true
    });
    
    const headlineCounts = new Map<string, number>();
    
    records.forEach((record: any) => {
      // Use player_id as the key for consistency
      headlineCounts.set(record.id, parseInt(record.headlines_count) || 0);
    });
    
    return headlineCounts;
  } catch (error) {
    return new Map();
  }
}
