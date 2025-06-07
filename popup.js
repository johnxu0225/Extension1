document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get("ocrText", (result) => {
    if (result.ocrText) {
      document.getElementById("output").innerText = result.ocrText;
      chrome.storage.local.remove("ocrText");
    }
  });
});

document.getElementById("screenshotBtn").addEventListener("click", async () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "show-overlay" });
  });
  document.getElementById("output").innerText = "Select a region...";
});
