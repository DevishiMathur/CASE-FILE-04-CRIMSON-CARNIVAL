import React from 'react';

interface Player {
  x: number;
  y: number;
  facing: number;
}

interface Anomaly {
  id: string;
  solved: boolean;
  puzzles: any[];
}

interface MinimapProps {
  player: Player;
  anomalies: Record<string, Anomaly>;
  allSolved: boolean;
  currentMap: number[][];
}

export function Minimap({ player, anomalies, allSolved, currentMap }: MinimapProps) {
  if (!currentMap) return null;

  return (
    <div className="minimap">
      {currentMap.map((row, y) => (
        <div key={`row-${y}`} style={{ display: 'flex', gap: '2px' }}>
          {row.map((cell, x) => {
            let className = "minimap-cell ";
            if (cell === 1) className += "wall";
            else if (cell === 2) {
              const anomaly = anomalies[`${y},${x}`];
              className += `anomaly ${anomaly?.solved ? 'solved' : ''}`;
            }
            else if (cell === 3) className += `exit ${allSolved ? 'unlocked' : ''}`;
            else if (cell === 4) className += `heart`;
            else className += "path";

            const isPlayerHere = player.x === x && player.y === y;

            return (
              <div
                key={`cell-${x}-${y}`}
                className={className}
                style={{
                  width: '100%',
                  aspectRatio: '1/1',
                  position: 'relative',
                  backgroundColor: cell === 4 ? 'var(--color-accent)' : undefined
                }}
              >
                {isPlayerHere && (
                  <div className="minimap-cell player" style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '60%', height: '60%'
                  }} />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
