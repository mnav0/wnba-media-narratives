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
}
