import React, { useState, useEffect } from 'react';

// --- LIGHTS OUT LOGIC ---
const getNeighbors = (index: number): number[] => {
  const neighbors = [index];
  if (index % 3 !== 0) neighbors.push(index - 1); // left
  if (index % 3 !== 2) neighbors.push(index + 1); // right
  if (index >= 3) neighbors.push(index - 3); // up
  if (index < 6) neighbors.push(index + 3); // down
  return neighbors;
};

interface LightsOutPuzzleProps {
  activeAnomaly: {
    pattern?: number[];
  };
  onSolve: () => void;
}

function LightsOutPuzzle({ activeAnomaly, onSolve }: LightsOutPuzzleProps) {
  const [grid, setGrid] = useState<boolean[]>(Array(9).fill(true));
  const [isSolving, setIsSolving] = useState<boolean>(false);

  useEffect(() => {
    let initialGrid = Array(9).fill(true);
    if (activeAnomaly.pattern) {
      activeAnomaly.pattern.forEach(clickIndex => {
        const neighbors = getNeighbors(clickIndex);
        initialGrid = initialGrid.map((val, i) => neighbors.includes(i) ? !val : val);
      });
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGrid(initialGrid);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSolving(false);
  }, [activeAnomaly]);

  const handleCellClick = (index: number) => {
    if (isSolving) return;
    const neighbors = getNeighbors(index);
    const newGrid = grid.map((val, i) => neighbors.includes(i) ? !val : val);
    setGrid(newGrid);

    if (newGrid.every(val => val === true)) {
      setIsSolving(true);
      setTimeout(onSolve, 1000);
    }
  };

  return (
    <>
      <p className="question-text" style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
        Align all nodes to decrypt this terminal.
      </p>
      <div className="decryption-grid">
        {grid.map((isAligned, index) => (
          <div 
            key={index} 
            className={`decryption-cell ${isAligned ? 'aligned' : 'corrupted'} ${isSolving ? 'solving' : ''}`}
            onClick={() => handleCellClick(index)}
          >
            <div className="glyph-inner"></div>
          </div>
        ))}
      </div>
    </>
  );
}

// --- QUESTION LOGIC ---
interface QuestionPuzzleProps {
  activeAnomaly: {
    question?: string;
    answer?: string;
  };
  onSolve: () => void;
}

function QuestionPuzzle({ activeAnomaly, onSolve }: QuestionPuzzleProps) {
  const [answer, setAnswer] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.toLowerCase().trim() === (activeAnomaly.answer || '').toLowerCase()) {
      setAnswer('');
      setError(false);
      onSolve();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <>
      <p className="question-text" style={{ marginBottom: '2rem', fontSize: '1.2rem', lineHeight: 1.5 }}>
        {activeAnomaly.question}
      </p>
      <form onSubmit={handleSubmit} className="modal-form">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter decryption key..."
          className="basic-input"
          autoFocus
          style={{ borderColor: error ? 'var(--color-danger)' : 'var(--color-accent)' }}
        />
        {error && <div className="error-text">Decryption Failed</div>}
        <button type="submit" className="basic-btn primary-btn" style={{ marginTop: '1rem' }}>
          Decrypt
        </button>
      </form>
    </>
  );
}

// --- SEQUENCE LOGIC ---
interface SequencePuzzleProps {
  activeAnomaly: {
    sequenceLength?: number;
  };
  onSolve: () => void;
}

function SequencePuzzle({ activeAnomaly, onSolve }: SequencePuzzleProps) {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerStep, setPlayerStep] = useState<number>(0);
  const [isShowing, setIsShowing] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [solved, setSolved] = useState<boolean>(false);

  const playSequence = (seq: number[]) => {
    setIsShowing(true);
    let step = 0;
    const interval = setInterval(() => {
      if (step >= seq.length) {
        clearInterval(interval);
        setActiveIndex(null);
        setIsShowing(false);
        return;
      }
      setActiveIndex(seq[step]);
      setTimeout(() => setActiveIndex(null), 400);
      step++;
    }, 800);
  };

  useEffect(() => {
    const len = activeAnomaly.sequenceLength || 4;
    const newSeq = Array.from({length: len}, () => Math.floor(Math.random() * 4));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSequence(newSeq);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlayerStep(0);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSolved(false);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(false);
    
    // Slight delay before starting sequence
    const timer = setTimeout(() => playSequence(newSeq), 500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAnomaly]);

  const handleTileClick = (index: number) => {
    if (isShowing || solved || error) return;

    setActiveIndex(index);
    setTimeout(() => setActiveIndex(null), 200);

    if (index === sequence[playerStep]) {
      const nextStep = playerStep + 1;
      setPlayerStep(nextStep);
      if (nextStep === sequence.length) {
        setSolved(true);
        setTimeout(onSolve, 1000);
      }
    } else {
      setError(true);
      setTimeout(() => {
        setError(false);
        setPlayerStep(0);
        playSequence(sequence);
      }, 1000);
    }
  };

  return (
    <>
      <p className="question-text" style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
        Observe and repeat the signal sequence.
      </p>
      <div className="sequence-grid" style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxWidth: '200px', margin: '0 auto'
      }}>
        {[0, 1, 2, 3].map(index => (
          <div 
            key={index}
            onClick={() => handleTileClick(index)}
            className={`sequence-cell ${activeIndex === index ? 'active' : ''} ${error ? 'error' : ''} ${solved ? 'solved' : ''}`}
            style={{
              aspectRatio: '1/1',
              border: '2px solid var(--color-danger)',
              background: 'rgba(0,0,0,0.8)',
              cursor: isShowing ? 'default' : 'pointer',
              transition: 'all 0.1s'
            }}
          ></div>
        ))}
      </div>
    </>
  );
}

// --- MAIN WRAPPER ---
interface Puzzle {
  type: string;
  pattern?: number[];
  question?: string;
  answer?: string;
  sequenceLength?: number;
}

interface ActiveAnomaly {
  key: string;
  puzzles?: Puzzle[];
  type?: string;
  pattern?: number[];
  question?: string;
  answer?: string;
  sequenceLength?: number;
}

interface QuestionModalProps {
  activeAnomaly: ActiveAnomaly | null;
  solveAnomaly: (key: string) => void;
  closeAnomaly: () => void;
  showMap: boolean;
}

export function QuestionModal({ activeAnomaly, solveAnomaly, closeAnomaly, showMap }: QuestionModalProps) {
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState<number>(0);
  const [prevAnomaly, setPrevAnomaly] = useState<ActiveAnomaly | null>(null);

  if (activeAnomaly !== prevAnomaly) {
    setPrevAnomaly(activeAnomaly);
    setCurrentPuzzleIndex(0);
  }

  if (!activeAnomaly) return null;

  const puzzles = activeAnomaly.puzzles || [activeAnomaly as Puzzle];
  const currentPuzzle = puzzles[currentPuzzleIndex];

  if (!currentPuzzle) return null;

  const handleSolve = () => {
    if (currentPuzzleIndex < puzzles.length - 1) {
      setCurrentPuzzleIndex(currentPuzzleIndex + 1);
    } else {
      solveAnomaly(activeAnomaly.key);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="hud-box modal-box" style={{ maxWidth: '450px' }}>
        <h2 className="modal-title">
          ANOMALY DETECTED {puzzles.length > 1 && `(${currentPuzzleIndex + 1}/${puzzles.length})`}
        </h2>
        <div className="modal-content">
          
          {currentPuzzle.type === 'lights_out' && <LightsOutPuzzle activeAnomaly={currentPuzzle} onSolve={handleSolve} />}
          {currentPuzzle.type === 'question' && <QuestionPuzzle activeAnomaly={currentPuzzle} onSolve={handleSolve} />}
          {currentPuzzle.type === 'sequence' && <SequencePuzzle activeAnomaly={currentPuzzle} onSolve={handleSolve} />}

          <div className="modal-actions" style={{ marginTop: '2rem' }}>
            <button type="button" onClick={closeAnomaly} className="basic-btn secondary-btn">
              Abort
            </button>
            {showMap && (
              <button 
                type="button" 
                onClick={handleSolve} 
                className="basic-btn primary-btn" 
                style={{ borderColor: 'var(--color-success)', color: 'var(--color-success)' }}
              >
                Override (Skip)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
