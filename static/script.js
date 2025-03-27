document.addEventListener('DOMContentLoaded', function() {
  const leafImage = document.getElementById("leaf-image");
  const leafCanvas = document.getElementById("leaf-canvas");
  const colorThresholdSlider = document.getElementById("color-threshold");
  const thresholdValueSpan = document.getElementById("threshold-value"); // This is a new span which we are going to use
  const analyzeManualBtn = document.getElementById("analyze-manual-btn");
  const resultDiv = document.getElementById("result");
  const ctx = leafCanvas.getContext("2d");

  let selectedFile = null; // Added this because fileInput was undefined

  // Initialize context to prevent errors
  if (ctx) {
    let drawing = false;
    let tool = "brush";
    let brushColor = "#ff0000";

    // Function to load the image onto the canvas
    function loadImageToCanvas(imageSrc) {
      leafImage.onload = () => {
        leafCanvas.width = leafImage.width;
        leafCanvas.height = leafImage.height;
        ctx.drawImage(leafImage, 0, 0, leafImage.width, leafImage.height);
        applyThreshold(colorThresholdSlider.value); // Apply initial threshold
      };
      leafImage.src = imageSrc;
    }

    // Function to apply a color threshold and highlight diseased areas
    function applyThreshold(threshold) {
      const imageData = ctx.getImageData(0, 0, leafCanvas.width, leafCanvas.height);
      const data = imageData.data; // Get image data array (r, g, b, a for each pixel)

      for (let i = 0; i < data.length; i += 4) {
        // Calculate some "color distance" measure - example uses red channel value, feel free to play with
        const colorValue = data[i]; // Red channel value

        if (colorValue > threshold) { // Simple comparison against the threshold
          // Highlight by setting a different color
          data[i] = 255; // Red
          data[i + 1] = 0; // Green
          data[i + 2] = 0; // Blue
          data[i + 3] = 255; // Alpha (fully opaque)
        } else { // Reset if not within the threshold to keep it normal
          data[i + 3] = 0; // Transparency set to 0, so it "erases". You can also do a white or grey tone
        }
      }

      ctx.putImageData(imageData, 0, 0); // Place image data
    }

    // slider's behavior, if changed, re-apply the threshold
    colorThresholdSlider.addEventListener("input", (e) => {
      const threshold = e.target.value;
      thresholdValueSpan.innerText = threshold;
      applyThreshold(threshold)
    });

    // Analyze image, sending the slider number to the backend.
    analyzeManualBtn.addEventListener("click", () => {
      const selectedThreshold = colorThresholdSlider.value;

      // You can either send the image as a data URL, or upload for your regular flow, depending on what you want
      fetch("https://phytoscan5-4.onrender.com/", { // Update url with new backend
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          threshold: selectedThreshold,
          imagePath: leafImage.src // Will get the base64 value to pass the function
        })
      })
        .then(response => response.json())
        .then(data => {
          resultDiv.innerHTML = `<h2>Infection Severity: ${data.severity}</h2>`;
        })
    });

    const fileInput = document.getElementById("file");

    fileInput.addEventListener("change", (e) => {
      selectedFile = e.target.files[0];
      if (selectedFile) {
        const previewUrl = URL.createObjectURL(selectedFile);
        loadImageToCanvas(previewUrl)
        leafImage.src = previewUrl
        analyzeBtn.disabled = !selectedFile;
      } else {
        resultDiv.innerHTML = "";
        leafImage.src = "";
      }
    });

  } else {
    console.error("Canvas context not supported.");
  }

  // Ensure Analyze button is always defined
    const analyzeBtn = document.getElementById("analyze-btn");
});