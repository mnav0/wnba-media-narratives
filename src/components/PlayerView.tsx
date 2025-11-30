'use client';

import { useState, useMemo } from 'react';
import EntityList from '@/src/components/EntityList';
import HeadlinesDisplay from '@/src/components/HeadlinesDisplay';
import { Entity, Headline } from '@/src/types';
import { analyzeHeadlines, TextAnalysisResult } from '@/src/lib/textAnalysis';

interface PlayerViewProps {
  entities: Entity[];
  headlinesArray: [number, Headline][];
}

export default function PlayerView({ entities, headlinesArray }: PlayerViewProps) {
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [allEntityHeadlines, setAllEntityHeadlines] = useState<Headline[]>([]);
  const [filteredHeadlines, setFilteredHeadlines] = useState<Headline[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
  // Convert array back to Map
  const allHeadlines = new Map(headlinesArray);

  // Get all player names for text analysis
  const allPlayerNames = useMemo(() => entities.map(e => e.name), [entities]);

  // Analyze headlines when entity is selected
  const textAnalysis: TextAnalysisResult | null = useMemo(() => {
    if (!selectedEntity || allEntityHeadlines.length === 0) return null;
    return analyzeHeadlines(allEntityHeadlines, allPlayerNames);
  }, [selectedEntity, allEntityHeadlines, allPlayerNames]);

  const handleEntityClick = (entity: Entity) => {
    setSelectedEntity(entity);
    setActiveFilter(null);
    
    // Get all headlines for this entity
    const entityHeadlines: Headline[] = entity.matchedHeadlines
      .map(id => allHeadlines.get(id))
      .filter((h): h is Headline => h !== undefined);
    
    setAllEntityHeadlines(entityHeadlines);
    setFilteredHeadlines(entityHeadlines);
  };

  const handleWordFilter = (word: string) => {
    if (activeFilter === word) {
      // Remove filter
      setActiveFilter(null);
      setFilteredHeadlines(allEntityHeadlines);
    } else {
      // Apply filter
      setActiveFilter(word);
      const filtered = allEntityHeadlines.filter(h => {
        const text = `${h.headline} ${h.summary || ''}`.toLowerCase();
        return text.includes(word.toLowerCase());
      });
      setFilteredHeadlines(filtered);
    }
  };

  const handleClose = () => {
    setSelectedEntity(null);
    setAllEntityHeadlines([]);
    setFilteredHeadlines([]);
    setActiveFilter(null);
  };

  return (
    <>
      {selectedEntity ? (
        <HeadlinesDisplay
          headlines={filteredHeadlines}
          entityName={selectedEntity.name}
          textAnalysis={textAnalysis}
          activeFilter={activeFilter}
          onWordClick={handleWordFilter}
          onClose={handleClose}
        />
      ) : (
        <EntityList
          entities={entities}
          onEntityClick={handleEntityClick}
          selectedEntity={selectedEntity}
        />
      )}
    </>
  );
}
