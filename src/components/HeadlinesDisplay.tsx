'use client';

import { Headline } from '@/src/types';
import { useMemo } from 'react';
import { TextAnalysisResult } from '@/src/lib/textAnalysis';

interface HeadlinesDisplayProps {
  headlines: Headline[];
  entityName: string;
  textAnalysis: TextAnalysisResult | null;
  activeFilter: string | null;
  onWordClick: (word: string) => void;
  onClose: () => void;
  hideHeader?: boolean; // Optional prop to hide header when used in tabs
}

export default function HeadlinesDisplay({ 
  headlines, 
  entityName, 
  textAnalysis,
  activeFilter,
  onWordClick,
  onClose,
  hideHeader = false
}: HeadlinesDisplayProps) {
  // Use fixed sizes and opacities to avoid hydration issues
  // Vary based on index for visual interest
  const headlinesWithLayout = useMemo(() => {
    return headlines.map((headline, index) => {
      // Create variation based on index using a simple pattern
      const variation = (index % 5) / 5; // Creates values: 0, 0.2, 0.4, 0.6, 0.8
      
      // Font sizes between 1.5rem and 4rem
      const fontSize = 1.5 + (variation * 2.5);
      
      // Opacity between 0.7 and 1.0
      const opacity = 0.7 + (variation * 0.3);
      
      return {
        ...headline,
        fontSize: `${fontSize}rem`,
        opacity: opacity
      };
    });
  }, [headlines]);

  return (
    <div className={hideHeader ? "" : "fixed inset-0 bg-[#f5f1e8] z-50 overflow-y-auto"}>
      {!hideHeader && (
        <div className="sticky top-0 bg-[#f5f1e8]/95 backdrop-blur border-b border-black z-10">
          <div className="p-4 flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-serif italic font-normal mb-4">{entityName}</h1>
            
            {textAnalysis && (
              <div className="space-y-3 text-sm">
                <p className="text-black/70">
                  {textAnalysis.totalHeadlines} headline{textAnalysis.totalHeadlines !== 1 ? 's' : ''}
                  {activeFilter && (
                    <span className="ml-2 text-black font-semibold">
                      (filtered by "{activeFilter}")
                    </span>
                  )}
                </p>
                
{textAnalysis.topWords.length > 0 && (
                  <div>
                    <p className="text-xs uppercase text-black/50 mb-1">Most frequent words</p>
                    <div className="flex flex-wrap gap-2">
                      {textAnalysis.topWords.map(({ word, count }) => (
                        <button
                          key={word}
                          onClick={() => onWordClick(word)}
                          className={`px-2 py-1 border border-black text-xs transition-colors ${
                            activeFilter === word
                              ? 'bg-black text-white'
                              : 'hover:bg-black hover:text-white text-black'
                          }`}
                          style={activeFilter !== word ? { backgroundColor: 'var(--color-neutral-light)', opacity: 0.7 } : undefined}
                        >
                          {word} ({count})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {textAnalysis.topAdjectives.length > 0 && (
                    <div>
                      <p className="text-xs uppercase text-black/50 mb-1">Top adjectives</p>
                      <div className="flex flex-wrap gap-2">
                        {textAnalysis.topAdjectives.map(({ word, count }) => (
                          <button
                            key={word}
                            onClick={() => onWordClick(word)}
                            className={`px-2 py-1 border border-black text-xs transition-colors ${
                              activeFilter === word
                                ? 'bg-black text-white'
                                : 'hover:bg-black hover:text-white text-black'
                            }`}
                            style={activeFilter !== word ? { backgroundColor: 'var(--color-adjective-light)', opacity: 0.7 } : undefined}
                          >
                            {word} ({count})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {textAnalysis.topVerbs.length > 0 && (
                    <div>
                      <p className="text-xs uppercase text-black/50 mb-1">Top verbs</p>
                      <div className="flex flex-wrap gap-2">
                        {textAnalysis.topVerbs.map(({ word, count }) => (
                          <button
                            key={word}
                            onClick={() => onWordClick(word)}
                            className={`px-2 py-1 border border-black text-xs transition-colors ${
                              activeFilter === word
                                ? 'bg-black text-white'
                                : 'hover:bg-black hover:text-white text-black'
                            }`}
                            style={activeFilter !== word ? { backgroundColor: 'var(--color-verb-light)', opacity: 0.7 } : undefined}
                          >
                            {word} ({count})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {textAnalysis.topPositiveWords.length > 0 && (
                    <div>
                      <p className="text-xs uppercase text-black/50 mb-1">
                        Positive language
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {textAnalysis.topPositiveWords.map(({ word, count, sentiment }) => (
                          <button
                            key={word}
                            onClick={() => onWordClick(word)}
                            className={`px-2 py-1 border border-black text-xs transition-colors ${
                              activeFilter === word
                                ? 'bg-black text-white'
                                : 'hover:bg-black hover:text-white text-black'
                            }`}
                            style={activeFilter !== word ? { backgroundColor: 'var(--color-positive-light)', opacity: 0.7 } : undefined}
                            title={`Sentiment: +${sentiment.toFixed(1)}`}
                          >
                            {word} ({count})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {textAnalysis.topNegativeWords.length > 0 && (
                    <div>
                      <p className="text-xs uppercase text-black/50 mb-1">
                        Negative language
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {textAnalysis.topNegativeWords.map(({ word, count, sentiment }) => (
                          <button
                            key={word}
                            onClick={() => onWordClick(word)}
                            className={`px-2 py-1 border border-black text-xs transition-colors ${
                              activeFilter === word
                                ? 'bg-black text-white'
                                : 'hover:bg-black hover:text-white text-black'
                            }`}
                            style={activeFilter !== word ? { backgroundColor: 'var(--color-negative-light)', opacity: 0.7 } : undefined}
                            title={`Sentiment: ${sentiment.toFixed(1)}`}
                          >
                            {word} ({count})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {textAnalysis.topPhrases.length > 0 && (
                  <div>
                    <p className="text-xs uppercase text-black/50 mb-1">Common phrases</p>
                    <div className="flex flex-wrap gap-2">
                      {textAnalysis.topPhrases.map(({ phrase, count }) => (
                        <button
                          key={phrase}
                          onClick={() => onWordClick(phrase)}
                          className={`px-2 py-1 border border-black text-xs transition-colors ${
                            activeFilter === phrase
                              ? 'bg-black text-white'
                              : 'hover:bg-black hover:text-white text-black'
                          }`}
                          style={activeFilter !== phrase ? { backgroundColor: 'var(--color-phrase-light)', opacity: 0.7 } : undefined}
                        >
                          "{phrase}" ({count})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="text-3xl leading-none text-black/60 hover:text-black transition-colors px-2 ml-4"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      </div>
      )}
      
      <div className="p-4 md:p-8">
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 md:gap-6">
          {headlinesWithLayout.map((item, index) => (
            <a
              key={index}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block mb-4 md:mb-6 break-inside-avoid hover:opacity-100 transition-opacity"
              style={{
                opacity: item.opacity
              }}
            >
              <h2 
                className="font-serif leading-tight text-black hover:text-black/80 transition-colors"
                style={{ fontSize: item.fontSize }}
              >
                {item.headline}
              </h2>
              
              {item.summary && (
                <p className="text-sm md:text-base text-black/70 mt-2 leading-relaxed">
                  {item.summary}
                </p>
              )}
              
              <div className="flex flex-wrap gap-2 text-xs text-black/50 mt-2">
                {item.source && (
                  <span className="font-medium">{item.source}</span>
                )}
                {item.datetime && (
                  <span>{new Date(item.datetime).toLocaleDateString()}</span>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
