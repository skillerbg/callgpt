const domElements = {
  saveButton: null,
  gptApi: null,
  lang: "en-US",
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
const rangeInputs = [
  "waitSeconds",
  "voiceSpeed",
  "voiceVolume",
  "voicePitch",
  "temperature",
  "maxLength",
  "topP",
  "frequencyPenalty",
  "presencePenalty"
];
document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => {
    const header = section.querySelector('.section-header');
    header.addEventListener('click', () => {
      
      section.classList.toggle('expanded');
      const content = section.querySelector('.section-content');
      if (section.classList.contains('expanded')) {
        content.style.display = 'block';
      } else {
        content.style.display = 'none';
      }
    });
  });
});
//Update the value display for the range inputs
function updateValueDisplay(inputElement) {
  const displayElement = document.getElementById(inputElement.id + "Value");
  displayElement.textContent = inputElement.value;
}

//Add event listeners to the dom elements
function attachEventListeners() {
  domElements.saveButton.addEventListener("click", saveOptions);
  domElements.toggleApiKeyVisibility.addEventListener("click", toggleApiKeyVisibility);

  

  rangeInputs.forEach((key) => {
    domElements[key].addEventListener("input", () => updateValueDisplay(domElements[key]));
  });
  domElements.testVoiceButton.addEventListener("click", testVoice);


}

//assign dom elements to the domElements object
function assignDomElements() {
  Object.keys(domElements).forEach((key) => {
    domElements[key] = document.getElementById(key);
  });
}
document.addEventListener("DOMContentLoaded", () => {
  assignDomElements();
  attachEventListeners();
});
// Save settings
function saveOptions() {
  console.log(domElements.voiceSelect.value);
  const voiceObj=JSON.parse(domElements.voiceSelect.value);
  
  const voiceValue = {
    voice: voiceObj.index,
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
    lang: voiceObj.lang,
    voice: voiceValue,
    gptSettings: gptSettings
  }, () => {
    console.log("Voice saved:", voiceValue);
    // Send a message to the background script
    chrome.runtime.sendMessage({ action: "optionsUpdated" });

    // Close the options tab
    window.close();
  });
};
// Toggle GPT API key visibility
function toggleApiKeyVisibility ()  {
  if (domElements.gptApi.type === "password") {
    domElements.gptApi.type = "text";
    toggleApiKeyVisibility.classList.remove("fa-eye");
    toggleApiKeyVisibility.classList.add("fa-eye-slash");
  } else {
    domElements.gptApi.type = "password";
    toggleApiKeyVisibility.classList.remove("fa-eye-slash");
    toggleApiKeyVisibility.classList.add("fa-eye");
  }
};
// Function to populate voice options
function populateVoiceList() {
  const voices = speechSynthesis.getVoices();
  console.log(voices);
//let defaultVoiceIndex = domElements.voiceSelect.value or 0
let defaultVoiceIndex;
if(domElements.voiceSelect.value !== undefined && domElements.voiceSelect.value !== ""){
  console.log(domElements.voiceSelect.value);
  const voiceObj=JSON.parse(domElements.voiceSelect.value);
   defaultVoiceIndex = voiceObj.index;
}else{
   defaultVoiceIndex = 0;
}

// set the first voice as default
 
   //console log the currently selected option from domElements.lang

  voices.forEach((voice, index) => {
   
    //set Google Us English as default if it is supported by the browser
    if (voice.name === "Microsoft Steffan Online (Natural) - English (United States)" && defaultVoiceIndex === 0 ) {
      defaultVoiceIndex = index;
    }
    if (voice.name === "Google US English" && defaultVoiceIndex === 0) {
      defaultVoiceIndex = index;
    }
   
    const option = document.createElement("option");
    option.textContent = voice.name;
    option.value = '{"index":' + index + ',"lang":"' + voice.lang + '"}';
  
    domElements.voiceSelect.appendChild(option);
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
function testVoice() {
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
};

// Populate settings from storage and then update the domElements
chrome.storage.sync.get(["gptApi", "waitSeconds", "voice", "gptSettings"], (data) => {
  if (data.gptApi) {
    domElements.gptApi.value = data.gptApi;
  }

  if (data.waitSeconds) {
    domElements.waitSeconds.value = data.waitSeconds;

  }

  if (data.voice) {
    console.log("the voice is: "+data.voice.voice);
    domElements.voiceSelect.selectedIndex = data.voice.voice;
    domElements.voiceSpeed.value = data.voice.speed;
    domElements.voiceVolume.value = data.voice.volume;
  }

  if (data.gptSettings) {
    domElements.system.value = data.gptSettings.system;
    domElements.model.value = data.gptSettings.model;
    domElements.temperature.value = data.gptSettings.temperature;
    domElements.maxLength.value = data.gptSettings.maxLength;
    domElements.topP.value = data.gptSettings.topP;
    domElements.frequencyPenalty.value = data.gptSettings.frequencyPenalty;
    domElements.presencePenalty.value = data.gptSettings.presencePenalty;
  }
  // Update the value display for all range inputs
  rangeInputs.forEach((key) => {
     updateValueDisplay(domElements[key]);
  });
});




