import { RiTa } from 'rita';
import sentiment from 'wink-sentiment';
import { Headline } from '@/src/types';

// Common stop words and player/team names to exclude
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
  'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'can', 'said', 'after', 'wnba', 'vs', 'game',
  'season', 'team', 'teams', 'player', 'players', 'star', 'win', 'wins',
  'loss', 'their', 'her', 'she', 'they', 'them', 'who', 'what', 'when',
  'where', 'how', 'why', 'all', 'new', 'first', 'last', 'over', 'after',
  'before', 'year', 'years', 'following', 's', 'this'
]);

// Common team names and abbreviations
const TEAM_NAMES = new Set([
  'liberty', 'aces', 'sparks', 'sky', 'mercury', 'sun', 'mystics',
  'fever', 'lynx', 'wings', 'storm', 'dream', 'valkyries', 'tempo',
  'indiana', 'chicago', 'phoenix', 'connecticut', 'washington',
  'minnesota', 'dallas', 'seattle', 'atlanta', 'las', 'vegas',
  'los', 'angeles', 'new', 'york', 'golden', 'state', 'toronto'
]);

// Sports-specific nouns that might be misclassified as adjectives or verbs
const SPORTS_NOUNS = new Set([
  'foul', 'fouls', 'doubledouble', 'allstar', 'playoff', 'playoffs',
  'championship', 'draft', 'rookie', 'mvp', 'coach', 'coaching',
  'fans', 'fan', 'rebounds', 'rebound', 'assists', 'assist',
  'points', 'point', 'scores', 'score', 'basket', 'baskets',
  'quarter', 'quarters', 'half', 'overtime', 'ot', 'finals',
  'semifinal', 'semifinals', 'guard', 'forward', 'center',
  'starter', 'starters', 'bench', 'court', 'arena', 'home', 'away',
]);

// Manual POS corrections for words that RiTa commonly misclassifies
const POS_OVERRIDES: Record<string, string> = {
  'fans': 'nn',          // noun, not verb
  'fan': 'nn',           // noun
  'foul': 'nn',          // noun in basketball context
  'fouls': 'nns',        // plural noun
  'tripledouble': 'nn',  // noun
  'tripledoubles': 'nns',  // plural noun
  'doubledouble': 'nn',  // noun
  'allstar': 'nn',       // noun
  'playoff': 'nn',       // noun
  'playoffs': 'nns',     // plural noun
  'finals': 'nns',       // plural noun
  'rebounds': 'nns',     // usually noun in sports
  'assists': 'nns',      // usually noun in sports
  'scores': 'nns',       // can be noun (the scores) more often than verb in headlines
  'unrivaled': 'nn'     // noun form
};

export interface TextAnalysisResult {
  totalHeadlines: number;
  topWords: Array<{ word: string; count: number }>;
  topAdjectives: Array<{ word: string; count: number }>;
  topVerbs: Array<{ word: string; count: number }>;
  topPositiveWords: Array<{ word: string; count: number; sentiment: number }>;
  topNegativeWords: Array<{ word: string; count: number; sentiment: number }>;
  topPhrases: Array<{ phrase: string; count: number }>;
  overallSentiment: number;
}

function isPlayerName(word: string, allPlayerNames: Set<string>): boolean {
  const lower = word.toLowerCase();
  return allPlayerNames.has(lower);
}

function shouldExcludeWord(word: string, allPlayerNames: Set<string>): boolean {
  const lower = word.toLowerCase();
  return (
    STOP_WORDS.has(lower) ||
    TEAM_NAMES.has(lower) ||
    isPlayerName(word, allPlayerNames) ||
    word.length < 3 ||
    /^\d+$/.test(word) // exclude pure numbers
  );
}

export function analyzeHeadlines(
  headlines: Headline[],
  allPlayerNames: string[]
): TextAnalysisResult {
  const playerNameSet = new Set(
    allPlayerNames.flatMap(name => 
      name.toLowerCase().split(/\s+/)
    )
  );

  const wordCounts = new Map<string, number>();
  const adjectiveCounts = new Map<string, number>();
  const verbCounts = new Map<string, number>();
  const emotionalWords = new Map<string, { count: number; totalSentiment: number }>();
  const phraseCounts = new Map<string, number>();
  let totalSentimentScore = 0;
  let totalTexts = 0;

  headlines.forEach(headline => {
    const text = `${headline.headline} ${headline.summary || ''}`;
    
    // Remove quoted text before sentiment analysis
    const textWithoutQuotes = text.replace(/"[^"]*"|'[^']*'/g, '');
    
    // Get sentiment analysis for the text without quotes
    const sentimentResult = sentiment(textWithoutQuotes);
    totalSentimentScore += sentimentResult.normalizedScore;
    totalTexts++;
    
    // Extract emotional words from sentiment analysis (excluding quoted words)
    sentimentResult.tokenizedPhrase.forEach(token => {
      if (token.score && Math.abs(token.score) >= 2) { // Only words with strong sentiment (±2 or more)
        const word = token.value.toLowerCase();
        if (!shouldExcludeWord(word, playerNameSet) && !SPORTS_NOUNS.has(word)) {
          const existing = emotionalWords.get(word) || { count: 0, totalSentiment: 0 };
          emotionalWords.set(word, {
            count: existing.count + 1,
            totalSentiment: existing.totalSentiment + token.score
          });
        }
      }
    });
    
    // Tokenize and get POS tags
    const words = RiTa.tokenize(text);
    const pos = RiTa.pos(words);

    words.forEach((word: string, index: number) => {
      const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
      
      if (!cleanWord || shouldExcludeWord(cleanWord, playerNameSet)) {
        return;
      }

      // Check for sports-specific nouns that shouldn't be counted as adjectives/verbs
      if (SPORTS_NOUNS.has(cleanWord)) {
        // Only count in general word frequency, not as adjectives or verbs
        wordCounts.set(cleanWord, (wordCounts.get(cleanWord) || 0) + 1);
        return;
      }

      // Get POS tag with manual override if available
      let tag = POS_OVERRIDES[cleanWord] || pos[index];
      tag = tag.toLowerCase();

      // Count all words (excluding stop words/teams/players)
      wordCounts.set(cleanWord, (wordCounts.get(cleanWord) || 0) + 1);

      // Count adjectives (JJ, JJR, JJS) - excluding nouns misclassified as adjectives
      if (tag.startsWith('jj') && !tag.startsWith('nn')) {
        adjectiveCounts.set(cleanWord, (adjectiveCounts.get(cleanWord) || 0) + 1);
      }

      // Count verbs (VB, VBD, VBG, VBN, VBP, VBZ) - excluding nouns misclassified as verbs
      if (tag.startsWith('vb') && !tag.startsWith('nn')) {
        verbCounts.set(cleanWord, (verbCounts.get(cleanWord) || 0) + 1);
      }
    });

    // Extract common phrases (bigrams and trigrams)
    const tokens = words.map(w => w.replace(/[^\w]/g, '').toLowerCase()).filter(w => w.length > 0);
    
    // Extract bigrams (2-word phrases)
    for (let i = 0; i < tokens.length - 1; i++) {
      const word1 = tokens[i];
      const word2 = tokens[i + 1];
      
      // Skip if either word is a stop word, team name, or player name
      if (shouldExcludeWord(word1, playerNameSet) || shouldExcludeWord(word2, playerNameSet)) {
        continue;
      }
      
      const bigram = `${word1} ${word2}`;
      phraseCounts.set(bigram, (phraseCounts.get(bigram) || 0) + 1);
    }
    
    // Extract trigrams (3-word phrases)
    for (let i = 0; i < tokens.length - 2; i++) {
      const word1 = tokens[i];
      const word2 = tokens[i + 1];
      const word3 = tokens[i + 2];
      
      // Skip if any word is a stop word, team name, or player name
      if (shouldExcludeWord(word1, playerNameSet) || 
          shouldExcludeWord(word2, playerNameSet) || 
          shouldExcludeWord(word3, playerNameSet)) {
        continue;
      }
      
      const trigram = `${word1} ${word2} ${word3}`;
      phraseCounts.set(trigram, (phraseCounts.get(trigram) || 0) + 1);
    }
  });

  // Get top 10 most frequent words
  const topWords = Array.from(wordCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));

  const topAdjectives = Array.from(adjectiveCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word, count]) => ({ word, count }));

  const topVerbs = Array.from(verbCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word, count]) => ({ word, count }));

  // Separate positive and negative emotional words, sorted by frequency
  const emotionalWordsArray = Array.from(emotionalWords.entries())
    .map(([word, data]) => ({
      word,
      count: data.count,
      sentiment: data.totalSentiment / data.count // average sentiment
    }));

  // Get top 10 positive words (sentiment >= 2, sorted by count)
  const topPositiveWords = emotionalWordsArray
    .filter(item => item.sentiment >= 2)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Get top 10 negative words (sentiment <= -2, sorted by count)
  const topNegativeWords = emotionalWordsArray
    .filter(item => item.sentiment <= -2)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const overallSentiment = totalTexts > 0 ? totalSentimentScore / totalTexts : 0;

  // Get top 20 phrases (minimum 2 occurrences to be significant)
  const topPhrases = Array.from(phraseCounts.entries())
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([phrase, count]) => ({ phrase, count }));

  return {
    totalHeadlines: headlines.length,
    topWords,
    topAdjectives,
    topVerbs,
    topPositiveWords,
    topNegativeWords,
    topPhrases,
    overallSentiment
  };
}
