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
