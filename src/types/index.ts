export interface Player {
  id: number;
  full_name: string;
  matched_headlines: number[];
  headlineCount: number;
}

export interface Headline {
  link: string;
  headline: string;
  datetime: string;
  source: string;
  summary: string;
  authors: string;
  image_desc: string;
}

export interface Entity {
  name: string;
  headlineCount: number;
  matchedHeadlines: number[];
  // Optional game-specific fields
  homeTeam?: string;
  awayTeam?: string;
  date?: string;
  gameId?: string;
  datetime?: string;
}

export interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamAbv: string;
  awayTeamAbv: string;
  datetime: string;
  headlineIds: number[];
  headlineCount: number;
}

export type FoulType = 'technical' | 'flagrant' | 'personal' | 'drawn';

export interface Play {
  eventNum: string;
  clock: string;
  description: string;
  teamVtmVideoUrl?: string;
  teamHtmVideoUrl?: string;
  foulType?: FoulType;
  isFoul: boolean;
}

export interface GamePlaysData {
  gameId: string;
  plays: Play[];
  technicalFouls: Play[];
  flagrantFouls: Play[];
  regularFouls: Play[];
}

export interface Video {
  videoUrl: string;
  playDescription: string;
  gameId: string;
  playerId?: string;
}

export interface VideoData {
  videos: Video[];
  videoCount: number;
}

export interface PhysicalityStat {
  id: string;
  name: string;
  personal: number | null;
  flagrant: number | null;
  technical: number | null;
  drawn: number | null;
}

export interface PhysicalityStatsByPlayer {
  [id: string]: PhysicalityStat;
}
