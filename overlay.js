let startX, startY, endX, endY, selectionBox;
let selecting = false;

function createOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'textgrabber-overlay';
  Object.assign(overlay.style, {
    position: 'fixed',
    top: 0, left: 0, width: '100vw', height: '100vh',
    background: 'rgba(0,0,0,0.1)',
    zIndex: 999999,
    cursor: 'crosshair'
  });
  document.body.appendChild(overlay);

  overlay.addEventListener('mousedown', e => {
    selecting = true;
    startX = e.clientX;
    startY = e.clientY;

    selectionBox = document.createElement('div');
    Object.assign(selectionBox.style, {
      position: 'fixed',
      border: '2px dashed #2196f3',
      background: 'rgba(33,150,243,0.2)',
      left: `${startX}px`,
      top: `${startY}px`,
      zIndex: 1000000
    });
    document.body.appendChild(selectionBox);
  });

  overlay.addEventListener('mousemove', e => {
    if (!selecting) return;
    endX = e.clientX;
    endY = e.clientY;
    const rect = {
      left: Math.min(startX, endX),
      top: Math.min(startY, endY),
      width: Math.abs(endX - startX),
      height: Math.abs(endY - startY)
    };
    Object.assign(selectionBox.style, {
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`
    });
  });

  overlay.addEventListener('mouseup', e => {
    selecting = false;
    endX = e.clientX;
    endY = e.clientY;
    const rect = {
      x: Math.min(startX, endX),
      y: Math.min(startY, endY),
      width: Math.abs(endX - startX),
      height: Math.abs(endY - startY)
    };
    overlay.remove();
    selectionBox.remove();
    chrome.runtime.sendMessage({ action: "region-selected", rect });
  });
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "show-overlay") {
    if (document.getElementById('textgrabber-overlay')) return; // Prevent multiple overlays

    const overlay = document.createElement('div');
    overlay.id = 'textgrabber-overlay';
    Object.assign(overlay.style, {
      position: 'fixed',
      top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.1)',
      zIndex: 999999,
      cursor: 'crosshair'
    });
    document.body.appendChild(overlay);

    let startX, startY, box;
    overlay.addEventListener('mousedown', e => {
      startX = e.clientX;
      startY = e.clientY;
      box = document.createElement('div');
      Object.assign(box.style, {
        position: 'fixed',
        border: '2px dashed #2196f3',
        background: 'rgba(33,150,243,0.2)',
        left: `${startX}px`,
        top: `${startY}px`,
        zIndex: 1000000
      });
      document.body.appendChild(box);

      function onMouseMove(ev) {
        const x = Math.min(startX, ev.clientX);
        const y = Math.min(startY, ev.clientY);
        const w = Math.abs(ev.clientX - startX);
        const h = Math.abs(ev.clientY - startY);
        Object.assign(box.style, {
          left: `${x}px`,
          top: `${y}px`,
          width: `${w}px`,
          height: `${h}px`
        });
      }

      function onMouseUp(ev) {
        overlay.remove();
        box.remove();
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        chrome.runtime.sendMessage({
          action: "region-selected",
          rect: {
            x: Math.min(startX, ev.clientX),
            y: Math.min(startY, ev.clientY),
            width: Math.abs(ev.clientX - startX),
            height: Math.abs(ev.clientY - startY)
          }
        });
      }

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  }
});