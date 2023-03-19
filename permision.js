console.log('try trigger authorization');
let recognition;
recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = "en-US";
recognition.onstart = function() {
    console.log('Speech recognition started');
  }
  
  recognition.onerror = function(event) {
    console.log('Speech recognition error', event.error);
  }
  
  recognition.onresult = function(event) {
    const result = event.results[event.resultIndex];
    const transcript = result[0].transcript;
    console.log('Transcript:', transcript);
  }
  recognition.start();