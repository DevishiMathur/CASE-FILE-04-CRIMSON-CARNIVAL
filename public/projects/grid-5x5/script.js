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
    if (!completed.includes("grid-5x5")) {
      localStorage.setItem(key, JSON.stringify([...completed, "grid-5x5"]));
    }
  } catch {}

  window.parent?.postMessage({ type: "cryptic-hunt-complete", slug: "grid-5x5" }, window.location.origin);
}

// ── STATE VARIABLES ──
let stage = 'searching'; // 'searching' | 'puzzle' | 'scanning' | 'victory'
let teamName = '';
let secondsElapsed = 0;
let timerInterval = null;
let ticketFullImage = null;

let pieces = [];
let board = Array(25).fill(null);
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

// ── TICKET VECTOR GENERATION ──
async function generateTicketImage() {
  const canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 1000;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');

  // Generate QR Code as data URL
  const qrDataUrl = await QRCode.toDataURL('CAN YOU SEE ME?', {
    version: 1,
    width: 220,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#ffffff'
    },
    errorCorrectionLevel: 'M'
  });

  // Load QR image
  const qrImg = await new Promise((resolve, reject) => {
    const img = new Image();
    img.src = qrDataUrl;
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
  });

  // Background Gradient
  const bgGrad = ctx.createRadialGradient(250, 250, 50, 250, 250, 350);
  bgGrad.addColorStop(0, '#50090e');
  bgGrad.addColorStop(1, '#1b0204');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 500, 500);

  // Borders
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#dbac49';
  ctx.strokeRect(15, 15, 470, 470);

  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(219, 172, 73, 0.4)';
  ctx.setLineDash([6, 4]);
  ctx.strokeRect(23, 23, 454, 454);
  ctx.setLineDash([]);

  // Stars
  const drawCornerStar = (cx, cy) => {
    ctx.fillStyle = '#dbac49';
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const r = i % 2 === 0 ? 8 : 3;
      ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
    }
    ctx.closePath();
    ctx.fill();
  };
  drawCornerStar(35, 35);
  drawCornerStar(465, 35);
  drawCornerStar(35, 465);
  drawCornerStar(465, 465);

  // Scallops
  const drawNotch = (cx, cy, r) => {
    ctx.fillStyle = '#0A0A0A';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#dbac49';
    ctx.beginPath();
    ctx.arc(cx, cy, r + 1, 0, Math.PI * 2);
    ctx.stroke();
  };
  drawNotch(15, 250, 18);
  drawNotch(485, 250, 18);
  drawNotch(250, 15, 18);
  drawNotch(250, 485, 18);

  // Header Title
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 4;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = '#ffe4a0';
  ctx.font = 'bold 36px serif';
  ctx.fillText('THE CARNIVAL', 250, 72);

  ctx.strokeStyle = '#dbac49';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(150, 96);
  ctx.bezierCurveTo(200, 102, 300, 102, 350, 96);
  ctx.stroke();

  ctx.fillStyle = '#dbac49';
  ctx.font = 'italic 16px Georgia, serif';
  ctx.fillText('• ADMIT ONE GUEST •', 250, 116);

  // QR Frame and Image
  ctx.fillStyle = '#dbac49';
  ctx.fillRect(136, 136, 228, 228);
  ctx.fillStyle = '#fcfcf0';
  ctx.fillRect(140, 140, 220, 220);
  ctx.drawImage(qrImg, 140, 140, 220, 220);

  // Footer text
  ctx.fillStyle = '#ffe4a0';
  ctx.font = '11px monospace';
  ctx.fillText('S E R I A L   N o .   0 6 - 2 3 - 2 0 2 6', 250, 395);

  ctx.fillStyle = '#dbac49';
  ctx.font = 'italic 15px Georgia, serif';
  ctx.fillText('“A ticket for those who seek the unseen.”', 250, 422);

  ctx.fillStyle = '#7a1921';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('VOID IF TORN OR SEPARATED', 250, 452);

  // Fold creases
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(219, 172, 73, 0.15)';
  ctx.beginPath(); ctx.moveTo(15, 120); ctx.lineTo(485, 380); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(15, 380); ctx.lineTo(485, 120); ctx.stroke();

  ticketFullImage = canvas.toDataURL('image/png');
  return ticketFullImage;
}

// ── PUZZLE SLICING & INITIALIZATION ──
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
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = 100;
      sliceCanvas.height = 100;
      const sctx = sliceCanvas.getContext('2d');
      if (!sctx) return;

      pieces = [];
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          const pid = r * 5 + c;
          sctx.clearRect(0, 0, 100, 100);
          sctx.drawImage(img, c * 100, r * 100, 100, 100, 0, 0, 100, 100);
          pieces.push({
            id: pid,
            dataUrl: sliceCanvas.toDataURL('image/png')
          });
        }
      }

      const idxArr = Array.from({ length: 25 }, (_, i) => i);
      idxArr.sort(() => Math.random() - 0.5);
      tray = idxArr;
      board = Array(25).fill(null);
      selectedPieceId = null;
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

  container.innerHTML = `
    <div class="w-full flex flex-col gap-4">
      <!-- Mini Row -->
      <div class="flex items-center justify-between gap-4 bg-zinc-950 border border-white/5 px-2.5 py-1.5 rounded text-[11px] font-mono">
        <div class="flex items-center gap-2">
          <span class="text-white/40">PLACED:</span>
          <span class="text-red-500 font-bold">${correctCount}/25</span>
        </div>
        <div class="flex gap-2">
          ${selectedBoardIndex !== null ? `
            <button id="btn-return" class="px-2 py-0.5 bg-red-950 border border-red-900/50 hover:bg-red-900 text-rose-200 text-[9px] rounded cursor-pointer">
              Return
            </button>
          ` : ''}
          <button id="btn-reset" class="flex items-center gap-1 px-2 py-0.5 bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-white/50 hover:text-white rounded text-[9px] cursor-pointer">
            Reset
          </button>
          <button id="btn-quick-solve" class="flex items-center gap-1 px-2 py-0.5 bg-red-950 border border-red-900 text-white text-[9px] rounded cursor-pointer">
            ✨ Solve
          </button>
        </div>
      </div>

      <!-- Main Columns -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
        <!-- Grid Board -->
        <div class="md:col-span-7 flex flex-col items-center">
          <div class="grid grid-cols-5 gap-[1px] bg-zinc-900 border border-white/10 rounded overflow-hidden w-[280px] h-[280px] sm:w-[320px] sm:h-[320px]">
            ${board.map((pid, idx) => {
              const belongs = pid !== null;
              const isSelected = selectedBoardIndex === idx;
              const matched = belongs ? pieces.find(p => p.id === pid) : null;

              return `
                <div data-cell-index="${idx}" class="relative select-none cursor-pointer aspect-square flex items-center justify-center transition-all bg-zinc-950 border border-white/5
                  ${isSelected ? 'ring-2 ring-red-500 z-10' : 'hover:bg-white/[0.02]'}
                ">
                  <span class="absolute text-[8px] font-mono text-white/10 z-0">${idx + 1}</span>
                  ${belongs && matched ? `
                    <img src="${matched.dataUrl}" class="w-full h-full object-cover absolute inset-0 pointer-events-none rounded-sm" />
                  ` : ''}
                  ${selectedPieceId !== null && !belongs ? `
                    <div class="absolute inset-0 bg-red-500/10 border border-dashed border-red-500/30 animate-pulse pointer-events-none"></div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Tray -->
        <div class="md:col-span-5">
          <div class="bg-zinc-950/40 border border-white/5 rounded p-2 h-[180px] md:h-[320px] overflow-y-auto">
            ${tray.length === 0 ? `
              <div class="h-full flex flex-col items-center justify-center text-center">
                <span class="text-[9px] font-mono text-white/30 uppercase">Empty</span>
              </div>
            ` : `
              <div class="grid grid-cols-5 md:grid-cols-4 gap-1.5">
                ${tray.map(pid => {
                  const item = pieces.find(p => p.id === pid);
                  const isSelected = selectedPieceId === pid;
                  if (!item) return '';

                  return `
                    <div data-tray-id="${pid}" class="relative aspect-square bg-zinc-900 border rounded p-0.5 cursor-pointer select-none transition-transform hover:scale-105
                      ${isSelected ? 'border-red-500 ring-1 ring-red-500 bg-zinc-800' : 'border-white/5 hover:border-white/10'}
                    ">
                      <img src="${item.dataUrl}" class="w-full h-full object-cover rounded pointer-events-none" />
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>
        </div>
      </div>

      <!-- Submit Button Row -->
      <div class="mt-6 w-full flex flex-col items-center gap-2">
        <button id="btn-submit-puzzle" class="w-full max-w-[320px] py-3 bg-red-600 hover:bg-red-500 font-mono text-xs uppercase tracking-widest font-black text-white rounded cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-950/30">
          SUBMIT ARRANGEMENT
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
        <div id="puzzle-error-hint" class="hidden flex items-center gap-2 text-rose-400 bg-red-950/40 border border-red-900/60 p-2.5 rounded text-[10px] font-mono max-w-[320px] w-full text-left">
          <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12 y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          <span id="puzzle-error-text">The ticket fibers are still misaligned. Ensure all 25 pieces are placed.</span>
        </div>
      </div>
    </div>
  `;

  // Attach Grid events
  container.querySelectorAll('[data-cell-index]').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.getAttribute('data-cell-index'));
      handleBoardClick(idx);
    });
  });

  // Attach Tray events
  container.querySelectorAll('[data-tray-id]').forEach(el => {
    el.addEventListener('click', () => {
      const id = parseInt(el.getAttribute('data-tray-id'));
      handleTrayClick(id);
    });
  });

  // Attach controls
  const btnReturn = document.getElementById('btn-return');
  if (btnReturn) btnReturn.addEventListener('click', handleReturnToTray);

  const btnReset = document.getElementById('btn-reset');
  if (btnReset) btnReset.addEventListener('click', () => {
    playBeep(400);
    const idxArr = Array.from({ length: 25 }, (_, i) => i);
    idxArr.sort(() => Math.random() - 0.5);
    tray = idxArr;
    board = Array(25).fill(null);
    selectedPieceId = null;
    selectedBoardIndex = null;
    renderPuzzle();
  });

  const btnSolve = document.getElementById('btn-quick-solve');
  if (btnSolve) btnSolve.addEventListener('click', () => {
    playBeep(700);
    board = Array.from({ length: 25 }, (_, i) => i);
    tray = [];
    selectedPieceId = null;
    selectedBoardIndex = null;
    renderPuzzle();
    setTimeout(() => {
      goToStage('scanning');
    }, 400);
  });

  const btnSubmitPuzzle = document.getElementById('btn-submit-puzzle');
  if (btnSubmitPuzzle) {
    btnSubmitPuzzle.addEventListener('click', () => {
      const correctCount = board.filter((id, i) => id === i).length;
      if (correctCount === 25) {
        playBeep(900, 0.15);
        goToStage('scanning');
      } else {
        playBeep(250, 0.25);
        const errEl = document.getElementById('puzzle-error-hint');
        if (errEl) {
          errEl.classList.remove('hidden');
          const placedCount = board.filter(b => b !== null).length;
          const textEl = document.getElementById('puzzle-error-text');
          if (textEl) {
            if (placedCount < 25) {
              textEl.textContent = `Please place all 25 pieces on the board first (${placedCount}/25 placed).`;
            } else {
              textEl.textContent = "The ticket fibers are still misaligned. Swap pieces to match the pattern correctly!";
            }
          }
          setTimeout(() => {
            errEl.classList.add('hidden');
          }, 4000);
        }
      }
    });
  }
}

function handleTrayClick(id) {
  playBeep(550);
  selectedPieceId = selectedPieceId === id ? null : id;
  selectedBoardIndex = null;
  renderPuzzle();
}

function handleBoardClick(index) {
  playBeep(500);

  // Place from Tray to empty Board cell
  if (selectedPieceId !== null && board[index] === null) {
    board[index] = selectedPieceId;
    tray = tray.filter(i => i !== selectedPieceId);
    selectedPieceId = null;
    renderPuzzle();
    checkSolved();
    return;
  }

  // Move Board piece to another empty Board cell
  if (selectedBoardIndex !== null && board[index] === null) {
    const moveId = board[selectedBoardIndex];
    if (moveId !== null) {
      board[index] = moveId;
      board[selectedBoardIndex] = null;
      selectedBoardIndex = null;
      renderPuzzle();
      checkSolved();
    }
    return;
  }

  // Select Board piece
  if (board[index] !== null) {
    if (selectedBoardIndex === index) {
      selectedBoardIndex = null;
    } else {
      selectedBoardIndex = index;
      selectedPieceId = null;
    }
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
  const solved = board.every((val, idx) => val === idx);
  if (solved) {
    setTimeout(() => {
      goToStage('scanning');
    }, 300);
  }
}

// ── SCREEN ROUTER ──
function goToStage(targetStage) {
  stage = targetStage;
  
  // Hide all screens
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

// ── LEADERBOARD WORKFLOW (FIRESTORE) ──
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
    let rank = 1;
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const name = data.teamName || "Anonymous Team";
      const secs = Number(data.secondsTaken) || 0;
      const isCurrent = name.trim().toUpperCase() === teamName.trim().toUpperCase();

      html += `
        <div class="flex items-center justify-between py-1.5 px-3 rounded text-xs font-mono
          ${isCurrent ? 'bg-red-950/25 border border-red-900/40 text-red-250' : 'bg-zinc-900/30 border border-white/[0.01] text-zinc-350'}
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

    if (!html) {
      boardList.innerHTML = `<div class="py-6 text-center text-white/30 font-mono text-xs">No teams registered yet.</div>`;
    } else {
      boardList.innerHTML = `<div class="space-y-1">${html}</div>`;
    }
  } catch (err) {
    console.error("Firebase load failed:", err);
    boardList.innerHTML = `<div class="py-6 text-center text-rose-450 font-mono text-xs">Connection trial failed.</div>`;
  }
}

// ── BUTTON INTERACTIVE BINDS ──
document.addEventListener('DOMContentLoaded', () => {
  // Start infiltration
  const btnStart = document.getElementById('btn-start');
  if (btnStart) {
    btnStart.addEventListener('click', () => {
      const inputEl = document.getElementById('team-input');
      const val = inputEl ? inputEl.value.trim() : '';
      if (!val) {
        const errEl = document.getElementById('search-error-hint');
        errEl.innerText = 'Please enter a team name to continue.';
        errEl.classList.remove('hidden');
        return;
      }
      teamName = val;
      goToStage('puzzle');
    });
  }

  // Handle enter key on team name
  const teamInput = document.getElementById('team-input');
  if (teamInput) {
    teamInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        btnStart.click();
      }
    });
  }

  // Scan Code verify
  const btnVerify = document.getElementById('btn-verify');
  if (btnVerify) {
    btnVerify.addEventListener('click', async () => {
      const wordInput = document.getElementById('word-input');
      const val = wordInput ? wordInput.value.trim().toUpperCase() : '';
      
      // Strip out question marks, punctuation, and all spaces to be highly tolerant of variations
      const cleanInput = val.replace(/[?.,!"]/g, '').replace(/\s+/g, '');
      const cleanSecret = 'CANYOUSEEME';

      if (cleanInput === cleanSecret) {
        playBeep(900, 0.2);
        goToStage('victory');
        await saveTeamScore(teamName, secondsElapsed);
        loadLeaderboard();
      } else {
        playBeep(250, 0.25);
        const errEl = document.getElementById('scanning-error-hint');
        errEl.innerText = 'The security sequence rejected your verification key.';
        errEl.classList.remove('hidden');
      }
    });
  }

  // Handle enter key on answer input
  const wordInput = document.getElementById('word-input');
  if (wordInput) {
    wordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        btnVerify.click();
      }
    });
  }

  // Restart trigger
  const btnRestart = document.getElementById('btn-restart');
  if (btnRestart) {
    btnRestart.addEventListener('click', () => {
      playBeep(350);
      teamName = '';
      const inputEl = document.getElementById('team-input');
      if (inputEl) inputEl.value = '';
      
      const wordEl = document.getElementById('word-input');
      if (wordEl) wordEl.value = '';

      const errEl = document.getElementById('search-error-hint');
      if (errEl) errEl.classList.add('hidden');

      const errElScan = document.getElementById('scanning-error-hint');
      if (errElScan) errElScan.classList.add('hidden');

      goToStage('searching');
    });
  }
});
