const audio = document.getElementById("audio");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 1000;
canvas.height = 520;

const freqSlider = document.getElementById("freqSlider");
const gainSlider = document.getElementById("gainSlider");
const noiseSlider = document.getElementById("noiseSlider");

const freqValue = document.getElementById("freqValue");
const gainValue = document.getElementById("gainValue");
const noiseValue = document.getElementById("noiseValue");

const status = document.getElementById("status");

const audioContext = new AudioContext();
const source = audioContext.createMediaElementSource(audio);

const analyser = audioContext.createAnalyser();
analyser.fftSize = 2048;

source.connect(analyser);
analyser.connect(audioContext.destination);

const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

let history = [];

audio.addEventListener("play", async () => {
    await audioContext.resume();
    animate();
});

freqSlider.addEventListener("input", () => {
    freqValue.innerText = freqSlider.value;
});

gainSlider.addEventListener("input", () => {
    gainValue.innerText = gainSlider.value;
});

noiseSlider.addEventListener("input", () => {
    noiseValue.innerText = noiseSlider.value;
});

function animate() {
    requestAnimationFrame(animate);

    analyser.getByteFrequencyData(dataArray);

    const freqScale = parseFloat(freqSlider.value);
    const gainScale = parseFloat(gainSlider.value);
    const noiseFloor = parseInt(noiseSlider.value);

    history.push([...dataArray]);

    if (history.length > canvas.width / 4) {
        history.shift();
    }

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let x = 0; x < history.length; x++) {
        const frame = history[x];

        for (let y = 0; y < frame.length; y++) {
            let intensity = frame[y] * gainScale;

            if (intensity < noiseFloor) continue;

            let mappedY = (y * freqScale) % canvas.height;

            const red = Math.min(intensity, 255);
            const green = Math.max(255 - intensity, 0);
            const blue = Math.min(intensity * 0.5, 255);

            ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;

            ctx.fillRect(
                x * 4,
                canvas.height - mappedY,
                4,
                2
            );
        }
    }

    detectSignal(freqScale, gainScale, noiseFloor);
}

function detectSignal(freq, gain, noise) {
    if (
        freq > 2.4 && freq < 2.6 &&
        gain > 1.4 && gain < 1.6 &&
        noise > 45 && noise < 55
    ) {
        status.innerText = "SIGNAL STABILIZED: CLASH";
    } else {
        status.innerText = "";
    }
}
const submitBtn = document.getElementById("submitBtn");
const modal = document.getElementById("answerModal");
const checkAnswer = document.getElementById("checkAnswer");
const answerInput = document.getElementById("answerInput");
const feedback = document.getElementById("feedback");

submitBtn.onclick = () => {
    modal.classList.remove("hidden");
};

checkAnswer.onclick = () => {
    const userAnswer = answerInput.value.trim().toUpperCase();

    if (userAnswer === "CRIMSON") {
        feedback.innerText = "Correct answer";
    } else {
        feedback.innerText = "Incorrect. Try again";
    }
};