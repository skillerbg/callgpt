const scriptTag = document.createElement('script');
scriptTag.setAttribute('src', 'sse.js');
document.documentElement.appendChild(scriptTag);

function MyComponent() {

  let gptApiKey, waitSeconds, voice, gptSettings, messegesRef, lang, stream,timeoutHandle, message="", resultRef="", sentenceRef="";
  initializeVariables();

  function initializeVariables() {
    chrome.storage.sync.get(["gptApi", "lang", "waitSeconds", "voice", "gptSettings"], (data) => {
      gptApiKey = data.gptApi;
      lang = data.lang;
      waitSeconds = data.waitSeconds;
      voice = data.voice;
      gptSettings = data.gptSettings;
       timeoutHandle = setTimeout(() => { }, waitSeconds * 1000);

      if (!lang.includes("en")) {
        gptSettings.system = gptSettings.system + " Language: " + lang;
      }
      messegesRef = [{ "role": "system", "content": gptSettings.system }];
      console.log("Messages:", messegesRef);
      console.log("GPT Settings:", gptSettings);
    });

    checkMicrophonePermissions();
  }

  function checkMicrophonePermissions() {
    navigator.permissions.query({ name: 'microphone' }).then((permissionStatus) => {
      if (permissionStatus.state === 'granted') {
        console.log("test!!!!!!!!!!!");
        onPermissionGranted();
      } else {
        chrome.tabs.create({ url: "popup.html" });
      }

      permissionStatus.onchange = function () {
        console.log("Permission changed to " + this.state);
      };
    });
  }

  async function onPermissionGranted() {
    if (lang === undefined) {
      await new Promise((resolve) => {
        chrome.storage.sync.get('lang', (data) => {
          lang = data.lang;
          console.log("Lang:", lang);
          resolve();
        });
      });
    }


    const recognition = new webkitSpeechRecognition();
    setupSpeechRecognition(recognition);

    recognition.start();
  }

  function setupSpeechRecognition(recognition) {
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onstart = () => console.log('Speech recognition started');
    recognition.onerror = (event) => console.log('Speech recognition error', event.error);

    recognition.onresult = (event) => {
      stream = false;
      speechSynthesis.cancel();

      clearTimeout(timeoutHandle);
      timeoutHandle = setTimeout(gpt, waitSeconds * 1000);

      message = event.results[event.resultIndex][0].transcript;
      console.log(message);

    };

    recognition.onstop = recognition.onend = () => recognition.start();
  }

  async function gpt() {
    console.log(message);

    if (messegesRef.length > 15) {
      messegesRef.splice(1, 6);
    }

    stream = true;
    messegesRef = ([...messegesRef, { "role": "user", "content": message }]);
    message = "";
    transcript = "";
    result = "";
    console.log(messegesRef);

    const url = "https://api.openai.com/v1/chat/completions";
    const data = {
      model: gptSettings.model,
      messages: messegesRef,
      stream: true,
      temperature: gptSettings.temperature,
      top_p: gptSettings.top_p,
      presence_penalty: gptSettings.presence_penalty,
      frequency_penalty: gptSettings.frequency_penalty
    };
    let source = new SSE(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${gptApiKey}`,
      },
      method: "POST",
      payload: JSON.stringify(data),
    });

    source.addEventListener("message", (e) => {
      handleSseMessage(e, source);
    });

    source.stream();
  }

  function handleSseMessage(e, source) {
    if (e.data === "[DONE]" || stream === false) {
      if (messegesRef[messegesRef.length - 1].role !== "assistant") {
        messegesRef = ([...messegesRef, { "role": "assistant", "content": resultRef }]);
      }
      resultRef = "";
      source.close();
    } else {
      let payload = JSON.parse(e.data);
      if (payload.choices[0].delta.content) {
        let text = payload.choices[0].delta.content;
        if (text && text !== "\n") {
          if (text === "." || text === "!" || text === "?" || text === ",") {
            resultRef = resultRef + text;
            console.log(resultRef);
            speakSentence(sentenceRef);
            sentenceRef = "";
          } else {
            resultRef = resultRef + text;
            console.log(resultRef);
            sentenceRef = sentenceRef + text;
          }
        }
      }
    }
  }

  function speakSentence(sentence) {
    const utterance = new SpeechSynthesisUtterance(sentence);
    const voices = speechSynthesis.getVoices();
    utterance.voice = voices[voice.voice];
    utterance.volume = voice.volume;
    utterance.pitch = voice.pitch;
    utterance.rate = voice.speed;
    speechSynthesis.speak(utterance);
  }
}