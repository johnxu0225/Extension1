document.getElementById('upload').addEventListener('change', function (e) {
  const file = e.target.files[0];       //Get the uploaded image
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function () {
    // Perform OCR with Tesseract
    Tesseract.recognize(
      reader.result,     //Image in base64 format
      'eng',             //Language (English)
      { logger: m => console.log(m) }  //Optional: logs OCR progress
    ).then(({ data: { text } }) => {
      document.getElementById('output').innerText = text;  //Show result
    });
  };
  reader.readAsDataURL(file);  //Read image as data URL for OCR
});
