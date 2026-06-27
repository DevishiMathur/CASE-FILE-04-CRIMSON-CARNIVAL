function decodeAnswer(encoded) {
  return atob(encoded)
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
}

const answers = {
  1: "Q0FSTklWQUwgQ0FST1VTRUw=", // CARNIVAL CAROUSEL
  2: "QU5PTUFMWSBERVRFQ1RFRA==", // ANOMALY DETECTED
  3: "RkFURSBXQVMgQUxSRUFEWSBXUklUVEVO" // FATE WAS ALREADY WRITTEN
};

const solvedAnswers = new Set();

function markGameComplete() {
  try {
    const key = "case4.completedProjects";
    const completed = JSON.parse(localStorage.getItem(key) || "[]");
    if (!completed.includes("steganography")) {
      localStorage.setItem(key, JSON.stringify([...completed, "steganography"]));
    }
  } catch {}

  window.parent?.postMessage({ type: "cryptic-hunt-complete", slug: "steganography" }, window.location.origin);
}

function checkAnswer(questionNum) {
  const input = document.getElementById(`a${questionNum}`).value
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();

  const result = document.getElementById(`result${questionNum}`);
  const correctAnswer = decodeAnswer(answers[questionNum]);

  console.log("INPUT:", input);
  console.log("CORRECT:", correctAnswer);

  if (input === correctAnswer) {
    result.innerText = "✓ Correct Answer";
    result.style.color = "lime";
    solvedAnswers.add(questionNum);

    if (solvedAnswers.size === Object.keys(answers).length) {
      markGameComplete();
    }
  } else {
    result.innerText = "✗ Incorrect. Try Again.";
    result.style.color = "red";
  }
}
