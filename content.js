import Tesseract from 'https://cdn.jsdelivr.net/npm/tesseract.js@5.0.1/dist/tesseract.min.js';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "start-capture") {
    // Take screenshot of the visible tab
    chrome.runtime.sendMessage({ action: "show-text", text: "Capturing screenshot..." });
    html2canvas(document.body).then(canvas => {
      const dataURL = canvas.toDataURL("image/png");
      Tesseract.recognize(dataURL, 'eng')
        .then(({ data: { text } }) => {
          chrome.storage.local.set({ ocrText: text });
          chrome.runtime.sendMessage({ action: "show-text", text });
        })
        .catch(err => {
          chrome.storage.local.set({ ocrText: "OCR error: " + err.message });
          chrome.runtime.sendMessage({ action: "show-text", text: "OCR error: " + err.message });
        });
    });
  }
});