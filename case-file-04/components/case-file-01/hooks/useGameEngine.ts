import { useState, useEffect, useCallback } from 'react';

export interface Player {
  x: number;
  y: number;
  facing: number;
}

export interface Puzzle {
  type: string;
  pattern?: number[];
  question?: string;
  answer?: string;
  sequenceLength?: number;
}

export interface Anomaly {
  id: string;
  puzzles: Puzzle[];
  solved: boolean;
}

export interface Level {
  map: number[][];
  anomalies: Record<string, Anomaly>;
  start: Player;
}

interface ActiveAnomaly extends Anomaly {
  key: string;
}

const LEVELS: Level[] = [
  {
    map: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1],
      [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1],
      [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
      [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1],
      [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1],
      [1, 0, 1, 0, 0, 2, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1],
      [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 2, 1, 0, 0, 0, 1, 0, 1, 1],
      [1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 1],
      [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 2, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
      [1, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 2, 0, 0, 0, 0, 1, 0, 1, 1],
      [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1],
      [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
      [1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1],
      [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1],
      [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 1],
      [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
      [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1, 1],
      [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    anomalies: {
      "27,13": {
        id: "a1",
        puzzles: [
          { type: "lights_out", pattern: [1, 4, 7] },
          { type: "lights_out", pattern: [1, 4, 7] },
          { type: "question", question: "What is the primary color of the sun?", answer: "yellow" }
        ],
        solved: false
      },
      "15,17": {
        id: "a2",
        puzzles: [
          { type: "lights_out", pattern: [1, 4, 7] },
          { type: "question", question: "What is the primary color of the sun?", answer: "yellow" },
          { type: "lights_out", pattern: [1, 4, 7] }
        ],
        solved: false
      },
      "25,24": {
        id: "a3",
        puzzles: [
          { type: "question", question: "What is the primary color of the sun?", answer: "yellow" },
          { type: "question", question: "What is the primary color of the sun?", answer: "yellow" },
          { type: "sequence", sequenceLength: 3 }
        ],
        solved: false
      },
      "25,16": {
        id: "a4",
        puzzles: [
          { type: "lights_out", pattern: [1, 4, 7] },
          { type: "question", question: "What is the primary color of the sun?", answer: "yellow" },
          { type: "sequence", sequenceLength: 3 }
        ],
        solved: false
      },
      "17,21": {
        id: "a5",
        puzzles: [
          { type: "question", question: "What is the primary color of the sun?", answer: "yellow" },
          { type: "question", question: "What is the primary color of the sun?", answer: "yellow" },
          { type: "question", question: "What is the primary color of the sun?", answer: "yellow" }
        ],
        solved: false
      },
      "17,1": {
        id: "a6",
        puzzles: [
          { type: "question", question: "What is the primary color of the sun?", answer: "yellow" },
          { type: "sequence", sequenceLength: 3 },
          { type: "question", question: "What is the primary color of the sun?", answer: "yellow" }
        ],
        solved: false
      },
      "9,5": {
        id: "a7",
        puzzles: [
          { type: "lights_out", pattern: [1, 4, 7] },
          { type: "sequence", sequenceLength: 3 },
          { type: "question", question: "What is the primary color of the sun?", answer: "yellow" }
        ],
        solved: false
      },
      "11,21": {
        id: "a8",
        puzzles: [
          { type: "lights_out", pattern: [1, 4, 7] },
          { type: "lights_out", pattern: [1, 4, 7] },
          { type: "lights_out", pattern: [1, 4, 7] }
        ],
        solved: false
      }
    },
    start: { x: 1, y: 1, facing: 1 }
  },
  {
    map: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    anomalies: {},
    start: { x: 7, y: 13, facing: 0 }
  }
];

export function useGameEngine() {
  const [levelIndex, setLevelIndex] = useState<number>(0);
  const [player, setPlayer] = useState<Player>(LEVELS[0].start);
  const [anomalies, setAnomalies] = useState<Record<string, Anomaly>>(LEVELS[0].anomalies);
  const [activeAnomaly, setActiveAnomaly] = useState<ActiveAnomaly | null>(null);

  const [showStory, setShowStory] = useState<boolean>(false);
  const [gameWon, setGameWon] = useState<boolean>(false);

  const currentLevel = LEVELS[levelIndex];
  const allSolved = Object.values(anomalies).every(a => a.solved);

  const movePlayer = useCallback((dx: number, dy: number) => {
    setPlayer(prev => {
      let nx = prev.x;
      let ny = prev.y;

      if (prev.facing === 0) { nx += dx; ny -= dy; }
      else if (prev.facing === 1) { nx += dy; ny += dx; }
      else if (prev.facing === 2) { nx -= dx; ny += dy; }
      else if (prev.facing === 3) { nx -= dy; ny -= dx; }

      if (ny >= 0 && ny < currentLevel.map.length && nx >= 0 && nx < currentLevel.map[0].length) {
        const targetTile = currentLevel.map[ny][nx];
        if (targetTile === 1) return prev;

        if (targetTile === 2) {
          const key = `${ny},${nx}`;
          if (!anomalies[key].solved) {
            setActiveAnomaly({ key, ...anomalies[key] });
            return prev;
          }
        }

        if (targetTile === 3) {
          if (allSolved) {
            if (levelIndex < LEVELS.length - 1) {
              const nextLevelIndex = levelIndex + 1;
              setLevelIndex(nextLevelIndex);
              setAnomalies(LEVELS[nextLevelIndex].anomalies);
              return LEVELS[nextLevelIndex].start;
            } else {
              setGameWon(true);
              return { ...prev, x: nx, y: ny };
            }
          }
          return prev;
        }

        if (targetTile === 4) {
          setShowStory(true);
          return prev;
        }

        return { ...prev, x: nx, y: ny };
      }
      return prev;
    });
  }, [anomalies, allSolved, currentLevel, levelIndex]);

  const turnPlayer = useCallback((dir: number) => {
    setPlayer(prev => ({
      ...prev,
      facing: (prev.facing + dir + 4) % 4
    }));
  }, []);

  useEffect(() => {
    if (activeAnomaly || showStory || gameWon) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w': case 'arrowup': movePlayer(0, 1); break;
        case 's': case 'arrowdown': movePlayer(0, -1); break;
        case 'a': case 'arrowleft': turnPlayer(-1); break;
        case 'd': case 'arrowright': turnPlayer(1); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer, turnPlayer, activeAnomaly, showStory, gameWon]);

  const solveAnomaly = (key: string) => {
    setAnomalies(prev => ({
      ...prev,
      [key]: { ...prev[key], solved: true }
    }));
    setActiveAnomaly(null);
  };

  const closeAnomaly = () => setActiveAnomaly(null);

  const finishStory = () => {
    setShowStory(false);
    setGameWon(true);
  };

  return {
    player,
    anomalies,
    activeAnomaly,
    solveAnomaly,
    closeAnomaly,
    gameWon,
    allSolved,
    movePlayer,
    turnPlayer,
    levelIndex,
    currentMap: currentLevel.map,
    showStory,
    finishStory
  };
}
