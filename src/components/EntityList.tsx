'use client';

import { Entity } from '@/src/types';

interface EntityListProps {
  entities: Entity[];
  onEntityClick: (entity: Entity) => void;
  selectedEntity: Entity | null;
  currentPage: number;
}

export default function EntityList({ entities, onEntityClick, selectedEntity, currentPage }: EntityListProps) {
  const isGame = (entity: Entity) => entity.homeTeam && entity.awayTeam;
  
  const ITEMS_PER_PAGE = 15;
  const totalPages = Math.ceil(entities.length / ITEMS_PER_PAGE);
  
  // Get entities for current page
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const pageEntities = entities.slice(startIndex, endIndex);
  
  // Pyramid layout: [1, 2, 3, 4, 5] items per row = 15 total
  // Always create full pyramid structure, filling from bottom up
  const pyramidRows: (Entity | null)[][] = [
    [],  // Row 1: 1 item
    [],  // Row 2: 2 items
    [],  // Row 3: 3 items
    [],  // Row 4: 4 items
    [],  // Row 5: 5 items
  ];
  
  const rowSizes = [1, 2, 3, 4, 5];
  
  // Fill from BEGINNING (most headlines) and place them in BOTTOM rows
  // Row 0 = top (1 item), Row 4 = bottom (5 items)
  let entityIndex = 0;
  
  // Fill from bottom row to top row (rowIdx 4 → 0)
  for (let rowIdx = rowSizes.length - 1; rowIdx >= 0; rowIdx--) {
    const rowSize = rowSizes[rowIdx];
    const rowEntities: (Entity | null)[] = [];
    
    for (let i = 0; i < rowSize; i++) {
      if (entityIndex < pageEntities.length) {
        rowEntities.push(pageEntities[entityIndex]);
        entityIndex++;
      } else {
        rowEntities.push(null);
      }
    }
    
    pyramidRows[rowIdx] = rowEntities;
  }
  
  return (
    <div className="w-full h-full flex flex-col">
      {/* Pyramid Grid - takes up full space */}
      <div className="flex-1 flex flex-col justify-start px-8 py-8 gap-4">
        {pyramidRows.map((row, rowIndex) => (
          <div 
            key={rowIndex}
            className="flex justify-start gap-4"
            style={{ height: '185px' }}
          >
            {row.map((entity, cellIndex) => 
              entity ? (
                <button
                  key={entity.gameId || entity.name}
                  onClick={() => onEntityClick(entity)}
                  className={`
                    p-6 border border-black transition-all duration-200 text-left
                    hover:bg-black hover:text-white group
                    flex flex-col justify-end
                    ${selectedEntity?.name === entity.name ? 'bg-black text-white' : 'bg-[#f5f1e8]'}
                  `}
                  style={{ 
                    width: '250px',
                    minWidth: '250px',
                    height: '185px'
                  }}
                >
                  {isGame(entity) ? (
                    <>
                      <p className="text-sm mb-2">
                        {entity.headlineCount} {entity.headlineCount === 1 ? 'headline' : 'headlines'}
                        {entity.date && (
                          <span className="text-xs opacity-40 pl-2 pr-1">|</span>
                        )}
                        {entity.date && (
                          <span className="text-xs opacity-40">{entity.date}</span>
                        )}
                      </p>
                      <div className="text-xl font-serif italic mb-2">
                        {entity.awayTeam}
                      </div>
                      <div className="border-b border-black/30 mb-2"></div>
                      <div className="text-xl font-serif italic">
                        {entity.homeTeam}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm mb-2">
                        {entity.headlineCount} {entity.headlineCount === 1 ? 'headline' : 'headlines'}
                      </p>
                      <h2 className="text-2xl font-serif italic font-normal">
                        {entity.name}
                      </h2>
                    </>
                  )}
                </button>
              ) : (
                <div
                  key={`empty-${rowIndex}-${cellIndex}`}
                  className="invisible"
                  aria-hidden="true"
                  style={{ 
                    width: '225px',
                    minWidth: '225px',
                    height: '140px'
                  }}
                />
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
