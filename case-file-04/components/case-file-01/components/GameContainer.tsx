"use client";
import '../styles.css';


import { useState, useEffect } from 'react';
import { useGameEngine } from '../hooks/useGameEngine';
import { FirstPersonView } from './FirstPersonView';
import { Minimap } from './Minimap';
import { QuestionModal } from './QuestionModal';
import { StoryModal } from './StoryModal';
import { ArrowUp, ArrowDown, CornerUpLeft, CornerUpRight } from 'lucide-react';

export default function GameContainer() {
  const { 
    player, anomalies, activeAnomaly, solveAnomaly, closeAnomaly, 
    gameWon, allSolved, movePlayer, turnPlayer, levelIndex, currentMap,
    showStory, finishStory
  } = useGameEngine();

  const [showMap, setShowMap] = useState<boolean>(false);

  useEffect(() => {
    (window as any).map = () => {
      setShowMap(prev => !prev);
      return "Map visibility toggled.";
    };
    return () => {
      delete (window as any).map;
    };
  }, []);

  const solvedCount = Object.values(anomalies).filter(a => a.solved).length;
  const totalAnomalies = Object.keys(anomalies).length;

  return (
    <div className="game-container">
      <div className="scanline-overlay"></div>

      <div className="hud-area">
        <div className="hud-box">
          <h3 style={{ margin: 0, color: 'var(--color-danger)' }}>PROJECT NULL</h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem' }}>SECTOR: TOMB {levelIndex + 1}</p>
          {levelIndex === 0 && (
            <p style={{ margin: '8px 0 0 0' }}>Anomalies Sealed: {solvedCount} / {totalAnomalies}</p>
          )}
          {levelIndex === 1 && (
            <p style={{ margin: '8px 0 0 0', color: 'var(--color-accent)' }}>Primary Objective Located</p>
          )}
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem', display: 'var(--desktop-instructions)' }}>W,A,S,D to navigate</p>
        </div>
      </div>

      <div className="viewport-area">
        <FirstPersonView player={player} anomalies={anomalies} allSolved={allSolved} currentMap={currentMap} />
      </div>

      <div className="controls-area">
        <div className="d-pad">
          <button className="basic-btn control-btn" onClick={() => turnPlayer(-1)}><CornerUpLeft size={32} /></button>
          <div className="up-down">
            <button className="basic-btn control-btn" onClick={() => movePlayer(0, 1)}><ArrowUp size={32} /></button>
            <button className="basic-btn control-btn" onClick={() => movePlayer(0, -1)}><ArrowDown size={32} /></button>
          </div>
          <button className="basic-btn control-btn" onClick={() => turnPlayer(1)}><CornerUpRight size={32} /></button>
        </div>
      </div>

      {showMap && (
        <div className="minimap-area">
          <Minimap player={player} anomalies={anomalies} allSolved={allSolved} currentMap={currentMap} />
        </div>
      )}

      <QuestionModal activeAnomaly={activeAnomaly} solveAnomaly={solveAnomaly} closeAnomaly={closeAnomaly} showMap={showMap} />

      {showStory && <StoryModal onClose={finishStory} />}

      {gameWon && (
        <div className="win-screen">
          <h1 className="glitch-text" data-text="PRISON SEALED">
            PRISON SEALED
          </h1>
          <p className="win-subtext">The future remains unborn.</p>
        </div>
      )}
    </div>
  );
}
