const domElements = {
    saveButton: null,
    gptApi: null,
    toggleApiKeyVisibility: null,
    waitSeconds: null,
    voiceSelect: null,
    testVoiceButton: null,
    voiceSpeed: null,
    voiceVolume: null,
    voicePitch: null,
    system: null,
    model: null,
    temperature: null,
    maxLength: null,
    topP: null,
    frequencyPenalty: null,
    presencePenalty: null,
  };
  
  function updateValueDisplay(inputElement) {
    const displayElement = document.getElementById(inputElement.id + "Value");
    displayElement.textContent = inputElement.value;
  }
  
  function attachEventListeners() {
    //domElements.saveButton.addEventListener("click", saveOptions);
    domElements.toggleApiKeyVisibility.addEventListener("click", toggleApiKeyVisibility);
  
    const rangeInputs = [
      "waitSeconds",
      "voiceSpeed",
      "voiceVolume",
      "voicePitch",
      "temperature",
      "maxLength",
      "topP",
      "frequencyPenalty",
      "presencePenalty",
    ];
  
    rangeInputs.forEach((key) => {
      domElements[key].addEventListener("input", () => updateValueDisplay(domElements[key]));
    });
  
  }
  function assignDomElements() {
    Object.keys(domElements).forEach((key) => {
      domElements[key] = document.getElementById(key);
    });
  }
  document.addEventListener("DOMContentLoaded", () => {
    assignDomElements();
    attachEventListeners();
    restoreOptions();
  });
  console.log(domElements);
  // Save settings
  domElements.saveButton.addEventListener("click", () => {
  const voiceValue = {
    voice: domElements.voiceSelect.value,
    speed: parseFloat(domElements.voiceSpeed.value),
    volume: parseFloat(domElements.voiceVolume.value),
    pitch: parseFloat(domElements.voicePitch.value),
  
  }
  const gptSettings = 
    {
      system: domElements.system.value,
      model: domElements.model.value,
      temperature: parseFloat(domElements.temperature.value),
      maxLength: parseFloat(domElements.maxLength.value),
      topP: parseFloat(domElements.topP.value),
      frequencyPenalty: parseFloat(domElements.frequencyPenalty.value),
      presencePenalty: parseFloat(domElements.presencePenalty.value),
    }
  
  chrome.storage.sync.set({ 
    gptApi: domElements.gptApi.value,
    waitSeconds: domElements.waitSeconds.value,
     voice: voiceValue,
      gptSettings: gptSettings
    }, () => {
    console.log("Voice saved:", voiceValue);
    // Send a message to the background script
    chrome.runtime.sendMessage({ action: "optionsUpdated" });
  
    // Close the options tab
    window.close();
  });
  });
  // Toggle GPT API key visibility
  toggleApiKeyVisibility.addEventListener("click", () => {
  if (domElements.gptApi.type === "password") {
    domElements.gptApi.type = "text";
    toggleApiKeyVisibility.classList.remove("fa-eye");
    toggleApiKeyVisibility.classList.add("fa-eye-slash");
  } else {
    domElements.gptApi.type = "password";
    toggleApiKeyVisibility.classList.remove("fa-eye-slash");
    toggleApiKeyVisibility.classList.add("fa-eye");
  }
  });
  // Function to populate voice options
  function populateVoiceList() {
  const voices = speechSynthesis.getVoices();
  console.log(voices);
  let defaultVoiceIndex = domElements.voiceSelect.value || 0; // set the first voice as default
  
  voices.forEach((voice, index) => {
  
    //set Google Us English as default if it is supported by the browser
    if(voice.name === "Microsoft Steffan Online (Natural) - English (United States)" && defaultVoiceIndex === 0){
      defaultVoiceIndex = index;
    }
    if (voice.name === "Google US English" && defaultVoiceIndex === 0) {
      defaultVoiceIndex = index;
    }
    const option = document.createElement("option");
    option.textContent = voice.name;
    option.value = index;
    domElements.voiceSelect.appendChild(option);
    console.log(domElements.voiceSelect);
  });
  
  //change the default voice if "Google Us English" is present
  if (defaultVoiceIndex !== 0) {
    domElements.voiceSelect.selectedIndex = defaultVoiceIndex;
  }
  }
  // Initialize voice options when the voices are loaded
  if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
  }
  
  
  
  
  // Test voice
  domElements.testVoiceButton.addEventListener("click", () => {
  const selectedVoiceIndex = domElements.voiceSelect.value;
  const selectedVoice = speechSynthesis.getVoices()[selectedVoiceIndex];
  const selectedSpeed = parseFloat(domElements.voiceSpeed.value);
  const selectedVolume = parseFloat(domElements.voiceVolume.value);
  const selectedPitch = parseFloat(domElements.voicePitch.value);
  
  const utterance = new SpeechSynthesisUtterance("This is a test of the selected voice.");
  utterance.voice = selectedVoice;
  utterance.rate = selectedSpeed; // Set the speech rate
  utterance.volume = selectedVolume; // Set the speech volume
  utterance.pitch = selectedPitch; // Set the speech pitch
  speechSynthesis.speak(utterance);
  });
  // Restore settings
  chrome.storage.sync.get("gptApi", (data) => {
  if (data.gptApi) {
    domElements.gptApi.value = data.gptApi;
  }
  });
  
  chrome.storage.sync.get("waitSeconds", (data) => {
  if (data.waitSeconds) {
    domElements.waitSeconds.value = data.waitSeconds;
    domElements.waitSecondsValue.textContent = data.waitSeconds;
  }
  });
  
  chrome.storage.sync.get("voice", (data) => {
  if (data.voice) {
    domElements.voiceSelect.value = data.voice.voice;
    domElements.voiceSpeed.value = data.voice.speed;
    domElements.voiceSpeedValue.textContent = data.voice.speed;
    domElements.voiceVolume.value = data.voice.volume;
  }
  }
  );
  chrome.storage.sync.get("gptSettings", (data) => {
  if (data.gptSettings) {
    domElements.system.value = data.gptSettings.system;
    domElements.model.value = data.gptSettings.model;
    domElements.temperature.value = data.gptSettings.temperature;
    domElements.maxLength.value = data.gptSettings.maxLength;
    domElements.topP.value = data.gptSettings.topP;
    domElements.frequencyPenalty.value = data.gptSettings.frequencyPenalty;
    domElements.presencePenalty.value = data.gptSettings.presencePenalty;
  }
  }
  );
  
  
  
  
  