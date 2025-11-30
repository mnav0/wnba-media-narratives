declare module 'wink-sentiment' {
  interface SentimentResult {
    score: number;
    normalizedScore: number;
    tokenizedPhrase: Array<{
      value: string;
      tag: string;
      score?: number;
    }>;
  }

  function sentiment(text: string): SentimentResult;
  export default sentiment;
}
