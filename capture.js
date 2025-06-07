import * as Tesseract from 'https://cdn.jsdelivr.net/npm/tesseract.js@5.0.1/dist/tesseract.min.js';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "region-selected") {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
      if (chrome.runtime.lastError || !dataUrl) {
        chrome.storage.local.set({ ocrText: "Failed to capture screenshot." });
        chrome.runtime.sendMessage({ action: "show-text", text: "Failed to capture screenshot." });
        return;
      }
      cropAndRecognize(dataUrl, request.rect);
    });
  }
});

function cropAndRecognize(dataUrl, rect) {
  const img = new Image();
  img.onload = () => {
    const scale = window.devicePixelRatio || 1;
    const canvas = new OffscreenCanvas(rect.width * scale, rect.height * scale);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      img,
      rect.x * scale, rect.y * scale, rect.width * scale, rect.height * scale,
      0, 0, rect.width * scale, rect.height * scale
    );
    canvas.convertToBlob({ type: "image/png" }).then(blob => {
      const reader = new FileReader();
      reader.onload = () => {
        Tesseract.default.recognize(reader.result, 'eng')
          .then(({ data: { text } }) => {
            chrome.storage.local.set({ ocrText: text });
            chrome.runtime.sendMessage({ action: "show-text", text });
            chrome.notifications.create({
              type: "basic",
              iconUrl: "icon.png",
              title: "OCR Result",
              message: text.substring(0, 1000) // Notifications have a length limit
            });
          })
          .catch(err => {
            chrome.storage.local.set({ ocrText: "OCR error: " + err.message });
            chrome.runtime.sendMessage({ action: "show-text", text: "OCR error: " + err.message });
          });
      };
      reader.readAsDataURL(blob);
    });
  };
  img.src = dataUrl;
}
