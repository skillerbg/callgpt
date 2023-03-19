let isOn = false;

function myFunction() {
  

    isOn = !isOn;


 
  if (isOn) {
    chrome.storage.sync.get("gptApi", (data) => {
      navigator.permissions.query(
        // { name: 'camera' }
        { name: 'microphone' }
        // { name: 'geolocation' }
        // { name: 'notifications' } 
        // { name: 'midi', sysex: false }
        // { name: 'midi', sysex: true }
        // { name: 'push', userVisibleOnly: true }
        // { name: 'push' } // without userVisibleOnly isn't supported in chrome M45, yet
      ).then(function (permissionStatus) {
      if (!data.gptApi || permissionStatus.state !== 'granted') {
        // The value is not set, open the options page in a new tab
        chrome.tabs.create({ url: "options.html" });
      }else{
        chrome.browserAction.setIcon({ path: "on-icon.png" });
        MyComponent();
      }
    });
  })
  
  } else {
    chrome.runtime.reload()
 
    chrome.browserAction.setIcon({ path: "off-icon.png" });
  }


}
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "optionsUpdated") {
    console.log("Options updated, handle changes in the background script");
    
    chrome.runtime.reload()


  }
});
  chrome.browserAction.onClicked.addListener(myFunction);