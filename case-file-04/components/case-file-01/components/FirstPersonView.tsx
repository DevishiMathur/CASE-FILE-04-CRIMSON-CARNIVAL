import React, { useMemo } from 'react';

interface Segment {
  dx: number;
  dy: number;
  points: string;
  type: 'wall' | 'front';
}

const SEGMENTS: Segment[] = [
  { dx: -1, dy: 0, points: "-1000,-1000 50,50 50,350 -1000,1400", type: 'wall' },
  { dx: 1, dy: 0, points: "350,50 1400,-1000 1400,1400 350,350", type: 'wall' },

  { dx: -1, dy: -1, points: "-250,50 50,50 50,350 -250,350", type: 'front' },
  { dx: 1, dy: -1, points: "350,50 650,50 650,350 350,350", type: 'front' },
  { dx: -1, dy: -1, points: "50,50 100,100 100,300 50,350", type: 'wall' },
  { dx: 1, dy: -1, points: "300,100 300,300 350,350 350,50", type: 'wall' },
  { dx: 0, dy: -1, points: "50,50 350,50 350,350 50,350", type: 'front' },

  { dx: -1, dy: -2, points: "-100,100 100,100 100,300 -100,300", type: 'front' },
  { dx: 1, dy: -2, points: "300,100 500,100 500,300 300,300", type: 'front' },
  { dx: -1, dy: -2, points: "100,100 150,150 150,250 100,300", type: 'wall' },
  { dx: 1, dy: -2, points: "300,100 250,150 250,250 300,300", type: 'wall' },
  { dx: 0, dy: -2, points: "100,100 300,100 300,300 100,300", type: 'front' },

  { dx: -1, dy: -3, points: "50,150 150,150 150,250 50,250", type: 'front' },
  { dx: 1, dy: -3, points: "250,150 350,150 350,250 250,250", type: 'front' },
  { dx: -1, dy: -3, points: "150,150 175,175 175,225 150,250", type: 'wall' },
  { dx: 1, dy: -3, points: "250,150 225,175 225,225 250,250", type: 'wall' },
  { dx: 0, dy: -3, points: "150,150 250,150 250,250 150,250", type: 'front' },

  { dx: -1, dy: -4, points: "125,175 175,175 175,225 125,225", type: 'front' },
  { dx: 1, dy: -4, points: "225,175 275,175 275,225 225,225", type: 'front' },
  { dx: -1, dy: -4, points: "175,175 187.5,187.5 187.5,212.5 175,225", type: 'wall' },
  { dx: 1, dy: -4, points: "225,175 212.5,187.5 212.5,212.5 225,225", type: 'wall' },
  { dx: 0, dy: -4, points: "175,175 225,175 225,225 175,225", type: 'front' }
];

function rotatePlayer(dx: number, dy: number, facing: number): [number, number] {
  let rotatedDx = dx;
  let rotatedDy = dy;
  for (let i = 0; i < facing; i++) {
    const temp = rotatedDx;
    rotatedDx = -rotatedDy;
    rotatedDy = temp;
  }
  return [rotatedDx, rotatedDy];
}

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

interface FirstPersonViewProps {
  player: Player;
  anomalies: Record<string, Anomaly>;
  allSolved: boolean;
  currentMap: number[][];
}

export function FirstPersonView({ player, anomalies, allSolved, currentMap }: FirstPersonViewProps) {
  const renderedPolygons = useMemo(() => {
    const polygons: React.ReactNode[] = [];
    const sortedSegments = [...SEGMENTS].sort((a, b) => {
      if (a.dy !== b.dy) {
        return a.dy - b.dy; 
      }
      if (a.type === 'wall' && b.type !== 'wall') return -1;
      if (a.type !== 'wall' && b.type === 'wall') return 1;
      return 0;
    });

    if (!currentMap) return null;

    for (let dir of sortedSegments) {
      let [dx, dy] = rotatePlayer(dir.dx, dir.dy, player.facing);
      let nx = player.x + dx;
      let ny = player.y + dy;

      if (ny >= 0 && ny < currentMap.length && nx >= 0 && nx < currentMap[0].length) {
        const tile = currentMap[ny][nx];

        if (tile === 1) {
          polygons.push(
            <polygon
              key={`wall-${nx}-${ny}-${dir.dx}-${dir.dy}-${dir.type}`}
              points={dir.points}
              fill={dir.type === 'front' ? "url(#wall-front-texture)" : "url(#wall-side-texture)"}
            />
          );
        } else if (tile === 2 && dir.type === 'front') {
          const anomalyState = anomalies[`${ny},${nx}`];
          const isSolved = anomalyState?.solved;

          const pts = dir.points.split(' ').map(p => p.split(',').map(Number));
          const cx = (pts[0][0] + pts[1][0]) / 2;
          const cy = (pts[0][1] + pts[3][1]) / 2;
          const r = (pts[1][0] - pts[0][0]) * 0.25;

          const color = isSolved ? "var(--color-success)" : "var(--color-danger)";

          polygons.push(
            <g key={`anomaly-${nx}-${ny}-${dir.dx}-${dir.dy}`}>
              <circle cx={cx} cy={cy} r={r} fill="#000000" stroke={color} strokeWidth="3" />
              <circle cx={cx} cy={cy} r={r*0.6} fill="none" stroke={color} strokeWidth="1" strokeDasharray="4 2" />
              <circle cx={cx} cy={cy} r={r*0.2} fill={color} />
              <path d={`M ${cx - r*1.2} ${cy} L ${cx + r*1.2} ${cy} M ${cx} ${cy - r*1.2} L ${cx} ${cy + r*1.2}`} stroke={color} strokeWidth="2" opacity="0.5" />
            </g>
          );
        } else if (tile === 3 && dir.type === 'front') {
          const pts = dir.points.split(' ').map(p => p.split(',').map(Number));
          const x0 = pts[0][0];
          const y0 = pts[0][1];
          const x1 = pts[1][0];
          const y2 = pts[2][1];

          polygons.push(
            <g key={`exit-${nx}-${ny}-${dir.dx}-${dir.dy}`}>
              <polygon
                points={dir.points}
                fill="url(#wall-front-texture)"
              />
              <rect x={x0 + (x1-x0)*0.2} y={y0 + (y2-y0)*0.2} width={(x1-x0)*0.6} height={(y2-y0)*0.8} fill={allSolved ? "var(--color-success)" : "#111111"} stroke="var(--wall-stroke)" strokeWidth="2" />
            </g>
          );
        } else if (tile === 4 && dir.type === 'front') {
          // Heart of Osiris
          const pts = dir.points.split(' ').map(p => p.split(',').map(Number));
          const cx = (pts[0][0] + pts[1][0]) / 2;
          const cy = (pts[0][1] + pts[3][1]) / 2;
          const r = (pts[1][0] - pts[0][0]) * 0.35;

          polygons.push(
            <g key={`heart-${nx}-${ny}-${dir.dx}-${dir.dy}`}>
              {/* Pulsating aura */}
              <circle cx={cx} cy={cy} r={r * 1.5} fill="rgba(212, 175, 55, 0.2)" stroke="none">
                <animate attributeName="r" values={`${r*1.2};${r*1.8};${r*1.2}`} dur="3s" repeatCount="indefinite" />
              </circle>
              {/* Core geometric shape */}
              <polygon points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`} fill="#000000" />
              <polygon points={`${cx},${cy - r*0.5} ${cx + r*0.5},${cy} ${cx},${cy + r*0.5} ${cx - r*0.5},${cy}`} fill="var(--color-accent)" />
            </g>
          );
        }
      }
    }
    return polygons;
  }, [player, anomalies, allSolved, currentMap]);

  return (
    <div className="viewport-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--color-bg)', width: '100%', height: '100%' }}>
      <svg width="100%" height="100%" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet" style={{ background: 'var(--sky-color)', border: '4px solid var(--wall-stroke)', maxHeight: '100%', maxWidth: '100%' }}>
        <defs>
          <pattern id="wall-front-texture" patternUnits="userSpaceOnUse" width="400" height="400">
            <image href="/case-file-01/wall-texture.png" x="0" y="0" width="400" height="400" preserveAspectRatio="none" />
          </pattern>
          <pattern id="wall-side-texture" patternUnits="userSpaceOnUse" width="400" height="400">
            <image href="/case-file-01/wall-texture.png" x="0" y="0" width="400" height="400" preserveAspectRatio="none" />
            <rect width="400" height="400" fill="rgba(0, 0, 0, 0.65)" />
          </pattern>
        </defs>

        <polygon points="0,200 400,200 400,400 0,400" fill="var(--floor-color)" />
        
        <line x1="50" y1="50" x2="50" y2="350" stroke="var(--wall-stroke)" strokeWidth="1" opacity="0.3" />
        <line x1="350" y1="50" x2="350" y2="350" stroke="var(--wall-stroke)" strokeWidth="1" opacity="0.3" />
        <line x1="50" y1="50" x2="350" y2="50" stroke="var(--wall-stroke)" strokeWidth="1" opacity="0.3" />
        <line x1="50" y1="350" x2="350" y2="350" stroke="var(--wall-stroke)" strokeWidth="1" opacity="0.3" />

        {renderedPolygons}
      </svg>
    </div>
  );
}
