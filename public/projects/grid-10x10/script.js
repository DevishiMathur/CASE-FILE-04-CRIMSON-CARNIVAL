import QRCode from 'https://cdn.jsdelivr.net/npm/qrcode@1.4.4/+esm';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// ── FIREBASE CONFIGURATION ──
const firebaseConfig = {
  apiKey: "AIzaSyBZ8P7oxgJVxESR0J1bTe1_LsWrR6-EWpA",
  authDomain: "starlit-guard-n1b2m.firebaseapp.com",
  projectId: "starlit-guard-n1b2m",
  storageBucket: "starlit-guard-n1b2m.firebasestorage.app",
  messagingSenderId: "451437609540",
  appId: "1:451437609540:web:14d63709b314ffd2d1b211"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-9e71cb0f-bd4b-4e61-98ec-bb0abdd53047");

function markGameComplete() {
  try {
    const key = "case4.completedProjects";
    const completed = JSON.parse(localStorage.getItem(key) || "[]");
    if (!completed.includes("grid-10x10")) {
      localStorage.setItem(key, JSON.stringify([...completed, "grid-10x10"]));
    }
  } catch {}

  window.parent?.postMessage({ type: "cryptic-hunt-complete", slug: "grid-10x10" }, window.location.origin);
}

// ── GRID CONSTANTS ──
const GRID  = 10;           // 10×10
const TOTAL = GRID * GRID;  // 100 pieces

// ── STATE VARIABLES ──
let stage = 'searching'; // 'searching' | 'puzzle' | 'scanning' | 'victory'
let teamName = '';
let secondsElapsed = 0;
let timerInterval = null;
let ticketFullImage = null;

let pieces = [];
let board = Array(TOTAL).fill(null);
let tray = [];
let selectedPieceId = null;
let selectedBoardIndex = null;

// ── AUDIO BEEP GENERATOR ──
function playBeep(freq = 600, duration = 0.08) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.01, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (err) {}
}

// ── TIMERS ──
function startTimer() {
  stopTimer();
  secondsElapsed = 0;
  updateTimerUI();
  timerInterval = setInterval(() => {
    secondsElapsed++;
    updateTimerUI();
  }, 1000);
  document.getElementById('nav-timer-container').classList.remove('hidden');
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function formatTime(totalSecs) {
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateTimerUI() {
  const textEl = document.getElementById('timer-text');
  if (textEl) {
    textEl.textContent = `⏰ ${formatTime(secondsElapsed)}`;
  }
}

// ── TICKET VECTOR GENERATION (1000×1000 for sharp 10×10 slicing) ──
async function generateTicketImage() {
  const canvas = document.createElement('canvas');
  canvas.width  = 1000;
  canvas.height = 1000;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');

  // Generate QR Code
  const qrDataUrl = await QRCode.toDataURL('CAN YOU SEE ME?', {
    version: 1,
    width: 440,
    margin: 1,
    color: { dark: '#000000', light: '#ffffff' },
    errorCorrectionLevel: 'M'
  });

  const qrImg = await new Promise((resolve, reject) => {
    const img = new Image();
    img.src = qrDataUrl;
    img.onload  = () => resolve(img);
    img.onerror = (err) => reject(err);
  });

  // Background Gradient
  const bgGrad = ctx.createRadialGradient(500, 500, 100, 500, 500, 700);
  bgGrad.addColorStop(0, '#50090e');
  bgGrad.addColorStop(1, '#1b0204');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1000, 1000);

  // Outer border
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#dbac49';
  ctx.strokeRect(30, 30, 940, 940);

  // Inner dashed border
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(219, 172, 73, 0.4)';
  ctx.setLineDash([12, 8]);
  ctx.strokeRect(46, 46, 908, 908);
  ctx.setLineDash([]);

  // Corner stars
  const drawCornerStar = (cx, cy) => {
    ctx.fillStyle = '#dbac49';
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const r = i % 2 === 0 ? 16 : 6;
      ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
    }
    ctx.closePath();
    ctx.fill();
  };
  drawCornerStar(70, 70);
  drawCornerStar(930, 70);
  drawCornerStar(70, 930);
  drawCornerStar(930, 930);

  // Side notches
  const drawNotch = (cx, cy, r) => {
    ctx.fillStyle = '#0A0A0A';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#dbac49';
    ctx.beginPath();
    ctx.arc(cx, cy, r + 2, 0, Math.PI * 2);
    ctx.stroke();
  };
  drawNotch(30, 500, 36);
  drawNotch(970, 500, 36);
  drawNotch(500, 30, 36);
  drawNotch(500, 970, 36);

  // Header
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur  = 8;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = '#ffe4a0';
  ctx.font = 'bold 72px serif';
  ctx.fillText('THE CARNIVAL', 500, 144);

  ctx.strokeStyle = '#dbac49';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(300, 192);
  ctx.bezierCurveTo(400, 204, 600, 204, 700, 192);
  ctx.stroke();

  ctx.fillStyle = '#dbac49';
  ctx.font = 'italic 32px Georgia, serif';
  ctx.fillText('• ADMIT ONE GUEST •', 500, 232);

  // QR frame + image
  ctx.fillStyle = '#dbac49';
  ctx.fillRect(272, 272, 456, 456);
  ctx.fillStyle = '#fcfcf0';
  ctx.fillRect(280, 280, 440, 440);
  ctx.drawImage(qrImg, 280, 280, 440, 440);

  // Footer
  ctx.fillStyle = '#ffe4a0';
  ctx.font = '22px monospace';
  ctx.fillText('S E R I A L   N o .   0 6 - 2 3 - 2 0 2 6', 500, 790);

  ctx.fillStyle = '#dbac49';
  ctx.font = 'italic 30px Georgia, serif';
  ctx.fillText('"A ticket for those who seek the unseen."', 500, 844);

  ctx.fillStyle = '#7a1921';
  ctx.font = 'bold 24px monospace';
  ctx.fillText('VOID IF TORN OR SEPARATED', 500, 904);

  // Fold creases
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(219, 172, 73, 0.15)';
  ctx.beginPath(); ctx.moveTo(30, 240); ctx.lineTo(970, 760); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(30, 760); ctx.lineTo(970, 240); ctx.stroke();

  ticketFullImage = canvas.toDataURL('image/png');
  return ticketFullImage;
}

// ── PUZZLE SLICING & INITIALIZATION (10×10 = 100 pieces) ──
async function initializePuzzle() {
  const container = document.getElementById('puzzle-board-container');
  if (container) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-10">
        <div class="w-8 h-8 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin mb-3"></div>
        <p class="font-mono text-[9px] text-red-500 uppercase tracking-widest animate-pulse">Slicing Fibers...</p>
      </div>
    `;
  }

  try {
    const imgUrl = await generateTicketImage();
    const img = new Image();
    img.src = imgUrl;
    img.onload = () => {
      // Each piece is 100×100 px from the 1000×1000 source
      const pieceSize = 1000 / GRID; // 100px

      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width  = pieceSize;
      sliceCanvas.height = pieceSize;
      const sctx = sliceCanvas.getContext('2d');
      if (!sctx) return;

      pieces = [];
      for (let r = 0; r < GRID; r++) {
        for (let c = 0; c < GRID; c++) {
          const pid = r * GRID + c;
          sctx.clearRect(0, 0, pieceSize, pieceSize);
          sctx.drawImage(img, c * pieceSize, r * pieceSize, pieceSize, pieceSize, 0, 0, pieceSize, pieceSize);
          pieces.push({ id: pid, dataUrl: sliceCanvas.toDataURL('image/png') });
        }
      }

      // Shuffle all pieces into the tray
      const idxArr = Array.from({ length: TOTAL }, (_, i) => i);
      idxArr.sort(() => Math.random() - 0.5);
      tray  = idxArr;
      board = Array(TOTAL).fill(null);
      selectedPieceId    = null;
      selectedBoardIndex = null;

      renderPuzzle();
    };
  } catch (err) {
    console.error('Puzzle slice error:', err);
  }
}

// ── RENDER PUZZLE VIEW ──
function renderPuzzle() {
  const container = document.getElementById('puzzle-board-container');
  if (!container) return;

  const correctCount = board.filter((id, i) => id === i).length;
  const placedCount  = board.filter(b => b !== null).length;

  container.innerHTML = `
    <div class="w-full flex flex-col gap-4">

      <!-- Status bar -->
      <div class="flex items-center justify-between gap-4 bg-zinc-950 border border-white/5 px-2.5 py-1.5 rounded text-[11px] font-mono">
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1.5">
            <span class="text-white/40">PLACED:</span>
            <span class="text-white font-bold">${placedCount}/${TOTAL}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-white/40">CORRECT:</span>
            <span class="text-red-500 font-bold">${correctCount}/${TOTAL}</span>
          </div>
        </div>
        <div class="flex gap-2">
          ${selectedBoardIndex !== null ? `
            <button id="btn-return" class="px-2 py-0.5 bg-red-950 border border-red-900/50 hover:bg-red-900 text-rose-200 text-[9px] rounded cursor-pointer">
              Return
            </button>
          ` : ''}
          <button id="btn-reset" class="px-2 py-0.5 bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-white/50 hover:text-white rounded text-[9px] cursor-pointer">
            Reset
          </button>
        </div>
      </div>

      <!-- Layout: board left, tray right -->
      <div class="flex flex-col xl:flex-row gap-4 items-start">

        <!-- 10×10 Board -->
        <div class="flex flex-col items-center flex-shrink-0">
          <p class="text-[9px] font-mono text-white/30 uppercase tracking-widest mb-1.5">Assembly Board</p>
          <div
            id="puzzle-grid"
            class="grid bg-zinc-900 border border-white/10 rounded overflow-hidden"
            style="
              grid-template-columns: repeat(${GRID}, 1fr);
              width: min(500px, 92vw);
              height: min(500px, 92vw);
              gap: 1px;
            "
          >
            ${board.map((pid, idx) => {
              const belongs   = pid !== null;
              const isSelected = selectedBoardIndex === idx;
              const matched   = belongs ? pieces.find(p => p.id === pid) : null;
              const isCorrect  = belongs && pid === idx;

              return `
                <div
                  data-cell-index="${idx}"
                  class="relative select-none cursor-pointer flex items-center justify-center transition-all bg-zinc-950
                    ${isSelected   ? 'ring-2 ring-inset ring-red-500 z-10'        : ''}
                    ${isCorrect    ? 'ring-1 ring-inset ring-green-600/40'         : ''}
                    ${!belongs && selectedPieceId !== null ? 'hover:bg-red-500/10' : 'hover:bg-white/[0.02]'}
                  "
                  style="aspect-ratio:1"
                >
                  ${belongs && matched ? `
                    <img src="${matched.dataUrl}" class="w-full h-full object-cover absolute inset-0 pointer-events-none" />
                  ` : `
                    <span class="text-[6px] font-mono text-white/8 select-none">${idx + 1}</span>
                  `}
                  ${selectedPieceId !== null && !belongs ? `
                    <div class="absolute inset-0 border border-dashed border-red-500/25 animate-pulse pointer-events-none"></div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Tray -->
        <div class="flex-1 w-full min-w-0">
          <p class="text-[9px] font-mono text-white/30 uppercase tracking-widest mb-1.5">
            Piece Tray — ${tray.length} remaining
          </p>
          <div class="bg-zinc-950/40 border border-white/5 rounded p-2 overflow-y-auto" style="max-height: min(500px, 60vh);">
            ${tray.length === 0 ? `
              <div class="py-10 flex flex-col items-center justify-center text-center">
                <span class="text-[9px] font-mono text-white/30 uppercase">All pieces placed</span>
              </div>
            ` : `
              <div class="grid gap-1" style="grid-template-columns: repeat(auto-fill, minmax(44px, 1fr));">
                ${tray.map(pid => {
                  const item = pieces.find(p => p.id === pid);
                  const isSelected = selectedPieceId === pid;
                  if (!item) return '';
                  return `
                    <div
                      data-tray-id="${pid}"
                      class="relative bg-zinc-900 border rounded p-0.5 cursor-pointer select-none transition-all hover:scale-110
                        ${isSelected ? 'border-red-500 ring-1 ring-red-500 bg-zinc-800 scale-110' : 'border-white/5 hover:border-white/20'}
                      "
                      style="aspect-ratio:1"
                    >
                      <img src="${item.dataUrl}" class="w-full h-full object-cover rounded pointer-events-none" />
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>

          <!-- Submit -->
          <div class="mt-4 flex flex-col gap-2">
            <button id="btn-submit-puzzle" class="w-full py-3 bg-red-600 hover:bg-red-500 font-mono text-xs uppercase tracking-widest font-black text-white rounded cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-950/30">
              SUBMIT ARRANGEMENT
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
            <div id="puzzle-error-hint" class="hidden flex items-center gap-2 text-rose-400 bg-red-950/40 border border-red-900/60 p-2.5 rounded text-[10px] font-mono w-full text-left">
              <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
              <span id="puzzle-error-text">The ticket fibers are still misaligned. Ensure all ${TOTAL} pieces are placed correctly.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;

  // ── Attach board cell events ──
  container.querySelectorAll('[data-cell-index]').forEach(el => {
    el.addEventListener('click', () => {
      handleBoardClick(parseInt(el.getAttribute('data-cell-index')));
    });
  });

  // ── Attach tray piece events ──
  container.querySelectorAll('[data-tray-id]').forEach(el => {
    el.addEventListener('click', () => {
      handleTrayClick(parseInt(el.getAttribute('data-tray-id')));
    });
  });

  // ── Controls ──
  const btnReturn = document.getElementById('btn-return');
  if (btnReturn) btnReturn.addEventListener('click', handleReturnToTray);

  const btnReset = document.getElementById('btn-reset');
  if (btnReset) btnReset.addEventListener('click', () => {
    playBeep(400);
    const idxArr = Array.from({ length: TOTAL }, (_, i) => i);
    idxArr.sort(() => Math.random() - 0.5);
    tray  = idxArr;
    board = Array(TOTAL).fill(null);
    selectedPieceId    = null;
    selectedBoardIndex = null;
    renderPuzzle();
  });

  const btnSolve = document.getElementById('btn-quick-solve');
  if (btnSolve) btnSolve.addEventListener('click', () => {
    playBeep(700);
    board = Array.from({ length: TOTAL }, (_, i) => i);
    tray  = [];
    selectedPieceId    = null;
    selectedBoardIndex = null;
    renderPuzzle();
    setTimeout(() => goToStage('scanning'), 400);
  });

  const btnSubmitPuzzle = document.getElementById('btn-submit-puzzle');
  if (btnSubmitPuzzle) {
    btnSubmitPuzzle.addEventListener('click', () => {
      const correct = board.filter((id, i) => id === i).length;
      if (correct === TOTAL) {
        playBeep(900, 0.15);
        goToStage('scanning');
      } else {
        playBeep(250, 0.25);
        const errEl  = document.getElementById('puzzle-error-hint');
        const textEl = document.getElementById('puzzle-error-text');
        if (errEl) {
          errEl.classList.remove('hidden');
          const placed = board.filter(b => b !== null).length;
          if (textEl) {
            if (placed < TOTAL) {
              textEl.textContent = `Please place all ${TOTAL} pieces on the board first (${placed}/${TOTAL} placed).`;
            } else {
              textEl.textContent = `The ticket fibers are still misaligned. ${correct}/${TOTAL} pieces in the correct position.`;
            }
          }
          setTimeout(() => errEl.classList.add('hidden'), 4000);
        }
      }
    });
  }
}

function handleTrayClick(id) {
  playBeep(550);
  selectedPieceId    = selectedPieceId === id ? null : id;
  selectedBoardIndex = null;
  renderPuzzle();
}

function handleBoardClick(index) {
  playBeep(500);

  // Place from tray → empty board cell
  if (selectedPieceId !== null && board[index] === null) {
    board[index]  = selectedPieceId;
    tray          = tray.filter(i => i !== selectedPieceId);
    selectedPieceId = null;
    renderPuzzle();
    checkSolved();
    return;
  }

  // Move board piece → another empty board cell
  if (selectedBoardIndex !== null && board[index] === null) {
    const moveId = board[selectedBoardIndex];
    if (moveId !== null) {
      board[index]          = moveId;
      board[selectedBoardIndex] = null;
      selectedBoardIndex    = null;
      renderPuzzle();
      checkSolved();
    }
    return;
  }

  // Swap two board pieces
  if (selectedBoardIndex !== null && board[index] !== null && selectedBoardIndex !== index) {
    const tmp               = board[index];
    board[index]            = board[selectedBoardIndex];
    board[selectedBoardIndex] = tmp;
    selectedBoardIndex      = null;
    renderPuzzle();
    checkSolved();
    return;
  }

  // Select a board piece
  if (board[index] !== null) {
    selectedBoardIndex = selectedBoardIndex === index ? null : index;
    selectedPieceId    = null;
    renderPuzzle();
  }
}

function handleReturnToTray() {
  if (selectedBoardIndex === null) return;
  const pid = board[selectedBoardIndex];
  if (pid === null) return;
  playBeep(450);
  board[selectedBoardIndex] = null;
  tray.push(pid);
  tray.sort((a, b) => a - b);
  selectedBoardIndex = null;
  renderPuzzle();
}

function checkSolved() {
  if (board.every((val, idx) => val === idx)) {
    setTimeout(() => goToStage('scanning'), 300);
  }
}

// ── SCREEN ROUTER ──
function goToStage(targetStage) {
  stage = targetStage;
  document.getElementById('screen-searching').classList.add('hidden');
  document.getElementById('screen-puzzle').classList.add('hidden');
  document.getElementById('screen-scanning').classList.add('hidden');
  document.getElementById('screen-victory').classList.add('hidden');

  if (stage === 'searching') {
    document.getElementById('screen-searching').classList.remove('hidden');
    document.getElementById('nav-timer-container').classList.add('hidden');
    stopTimer();
  } else if (stage === 'puzzle') {
    document.getElementById('screen-puzzle').classList.remove('hidden');
    startTimer();
    initializePuzzle();
  } else if (stage === 'scanning') {
    document.getElementById('screen-scanning').classList.remove('hidden');
    const qrContainer = document.getElementById('scanned-ticket-container');
    if (qrContainer && ticketFullImage) {
      qrContainer.innerHTML = `<img src="${ticketFullImage}" alt="Scanned Passkey" class="w-full h-full object-contain rounded" />`;
    }
  } else if (stage === 'victory') {
    document.getElementById('screen-victory').classList.remove('hidden');
    document.getElementById('victory-team-badge').innerText = `🏆 Team ${teamName.toUpperCase()} finalized in ${formatTime(secondsElapsed)}!`;
    markGameComplete();
    stopTimer();
    loadLeaderboard();
  }
}

// ── LEADERBOARD (FIRESTORE) ──
async function saveTeamScore(team, duration) {
  try {
    await addDoc(collection(db, "leaderboard"), {
      teamName: team,
      secondsTaken: duration,
      solvedAt: serverTimestamp()
    });
  } catch (err) {
    console.error("Firebase save failed:", err);
  }
}

async function loadLeaderboard() {
  const boardList = document.getElementById('leaderboard-list');
  if (!boardList) return;

  boardList.innerHTML = `
    <div class="py-10 flex flex-col items-center justify-center text-center">
      <div class="w-6 h-6 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin mb-2"></div>
      <span class="text-[9px] font-mono text-white/30 uppercase">Querying active records...</span>
    </div>
  `;

  try {
    const q = query(collection(db, "leaderboard"), orderBy("secondsTaken", "asc"), limit(30));
    const snapshot = await getDocs(q);

    let html = '';
    let rank  = 1;
    snapshot.forEach((doc) => {
      const data      = doc.data();
      const name      = data.teamName || "Anonymous Team";
      const secs      = Number(data.secondsTaken) || 0;
      const isCurrent = name.trim().toUpperCase() === teamName.trim().toUpperCase();

      html += `
        <div class="flex items-center justify-between py-1.5 px-3 rounded text-xs font-mono mb-1
          ${isCurrent
            ? 'bg-red-950/25 border border-red-900/40 text-red-250'
            : 'bg-zinc-900/30 border border-white/[0.01] text-zinc-350'}
        ">
          <div class="flex items-center gap-2 truncate">
            <span class="font-bold text-red-500/80 w-5">#${rank}</span>
            <span class="truncate max-w-[180px] uppercase font-semibold text-white/90">${name}</span>
          </div>
          <span class="font-bold text-red-300 opacity-90">${formatTime(secs)}</span>
        </div>
      `;
      rank++;
    });

    boardList.innerHTML = html
      ? `<div>${html}</div>`
      : `<div class="py-6 text-center text-white/30 font-mono text-xs">No teams registered yet.</div>`;

  } catch (err) {
    console.error("Firebase load failed:", err);
    boardList.innerHTML = `<div class="py-6 text-center text-rose-450 font-mono text-xs">Connection trial failed.</div>`;
  }
}

// ── BUTTON BINDINGS ──
document.addEventListener('DOMContentLoaded', () => {
  // Start
  const btnStart = document.getElementById('btn-start');
  if (btnStart) {
    btnStart.addEventListener('click', () => {
      const inputEl = document.getElementById('team-input');
      const val     = inputEl ? inputEl.value.trim() : '';
      if (!val) {
        document.getElementById('search-error-hint').classList.remove('hidden');
        return;
      }
      teamName = val;
      goToStage('puzzle');
    });
  }

  const teamInput = document.getElementById('team-input');
  if (teamInput) {
    teamInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('btn-start').click();
    });
  }

  // Verify answer
  const btnVerify = document.getElementById('btn-verify');
  if (btnVerify) {
    btnVerify.addEventListener('click', async () => {
      const wordInput  = document.getElementById('word-input');
      const val        = wordInput ? wordInput.value.trim().toUpperCase() : '';
      const cleanInput = val.replace(/[?.,!"]/g, '').replace(/\s+/g, '');
      const cleanSecret = 'CANYOUSEEME';

      if (cleanInput === cleanSecret) {
        playBeep(900, 0.2);
        goToStage('victory');
        await saveTeamScore(teamName, secondsElapsed);
        loadLeaderboard();
      } else {
        playBeep(250, 0.25);
        document.getElementById('scanning-error-hint').classList.remove('hidden');
      }
    });
  }

  const wordInput = document.getElementById('word-input');
  if (wordInput) {
    wordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('btn-verify').click();
    });
  }

  // Restart
  const btnRestart = document.getElementById('btn-restart');
  if (btnRestart) {
    btnRestart.addEventListener('click', () => {
      playBeep(350);
      teamName = '';
      const inputEl = document.getElementById('team-input');
      if (inputEl) inputEl.value = '';
      const wordEl = document.getElementById('word-input');
      if (wordEl) wordEl.value = '';
      document.getElementById('search-error-hint')?.classList.add('hidden');
      document.getElementById('scanning-error-hint')?.classList.add('hidden');
      goToStage('searching');
    });
  }
});
