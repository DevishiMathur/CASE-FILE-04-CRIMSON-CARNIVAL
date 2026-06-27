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
  } else {
    result.innerText = "✗ Incorrect. Try Again.";
    result.style.color = "red";
  }
}