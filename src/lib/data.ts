import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { Entity, Headline, Game } from '@/src/types';

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
