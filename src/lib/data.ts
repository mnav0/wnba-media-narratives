import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { Entity, Headline, Game, Play, GamePlaysData, FoulType } from '@/src/types';

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
    const date = new Date(datetime).toLocaleDateString('en-US', {
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
    // Sort by date (newest first)
    const dateA = new Date(a.datetime || '');
    const dateB = new Date(b.datetime || '');
    return dateB.getTime() - dateA.getTime();
  });
  
  return entities;
}

// Helper function to detect foul type from play description
// TODO: This is temporary - remove when foul types are standardized in CSV
function detectFoulType(description: string): { isFoul: boolean; foulType?: FoulType } {
  const desc = description.toLowerCase();
  
  // Check for technical foul
  if (desc.includes('t.foul') || desc.includes('technical foul')) {
    return { isFoul: true, foulType: 'technical' };
  }
  
  // Check for flagrant foul
  if (desc.includes('flagrant.foul') || desc.includes('flagrant foul')) {
    return { isFoul: true, foulType: 'flagrant' };
  }
  
  // Check for regular fouls (but exclude free throws)
  if ((desc.includes('foul') || desc.includes('p.foul') || desc.includes('s.foul')) && 
      !desc.includes('free throw') && 
      !desc.includes('technical free throw') && 
      !desc.includes('flagrant free throw')) {
    return { isFoul: true, foulType: 'regular' };
  }
  
  return { isFoul: false };
}

export function getGamePlays(gameId: string, datetime: string): GamePlaysData | null {
  // Construct filename from datetime and gameId
  // Format: YYYY-MM-DD_TEAM-TEAM_GAMEID.csv
  const date = datetime.split('T')[0]; // Get YYYY-MM-DD part
  
  // Try to find the CSV file in the games subdirectory
  const dataDir = path.join(process.cwd(), 'src', 'data', 'games');
  
  try {
    // List all CSV files and find one matching the game ID
    const files = fs.readdirSync(dataDir);
    const gameFile = files.find(f => f.includes(gameId) && f.endsWith('.csv'));
    
    if (!gameFile) {
      console.log(`No play-by-play file found for game ${gameId}`);
      return null;
    }
    
    const csvPath = path.join(dataDir, gameFile);
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true
    });
    
    const plays: Play[] = records.map((record: any) => {
      // Get description from either team column (one will have the play description)
      const description = record['play-team-vtm'] || record['play-team-htm'] || '';
      const { isFoul, foulType } = detectFoulType(description);
      
      // Get video URLs from CSV columns (empty string means no video available)
      const recordVtmVideo = record['play-team-vtm-video-url'];
      const recordHtmVideo = record['play-team-htm-video-url'];
      
      return {
        eventNum: record[''] || '',
        clock: record['time'] || '',
        description: description,
        teamVtmVideoUrl: isFoul ? recordVtmVideo : undefined,
        teamHtmVideoUrl: isFoul ? recordHtmVideo : undefined,
        foulType: foulType,
        isFoul: isFoul
      };
    });
    
    // Filter and categorize fouls
    // Sort by severity: flagrant first, then technical, then regular
    const allFouls = plays.filter(p => p.isFoul);
    const flagrantFouls = allFouls.filter(p => p.foulType === 'flagrant');
    const technicalFouls = allFouls.filter(p => p.foulType === 'technical');
    const regularFouls = allFouls.filter(p => p.foulType === 'regular');
    
    return {
      gameId,
      plays,
      technicalFouls,
      flagrantFouls,
      regularFouls
    };
  } catch (error) {
    console.error(`Error loading game plays for ${gameId}:`, error);
    return null;
  }
}
