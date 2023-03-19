// Initialize voice options when the voices are loaded
if (speechSynthesis.onvoiceschanged !== undefined) {
    console.log("SpeechSynthesisUtterance is supported");
    speechSynthesis.onvoiceschanged = populateVoiceList;
  }