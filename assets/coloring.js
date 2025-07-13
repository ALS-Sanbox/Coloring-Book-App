window.onload = () => {
  const swatchesContainer = document.getElementById("swatchesContainer");
  const colorThemeBtn = document.getElementById("colorThemeBtn");
  const fillPreviewRect = document.getElementById("fillPreviewRect");
  const svgDefs = document.querySelector('svg defs'); // get defs container to update gradients

  const themes = {
    base: [
      "#ffffff", "#000000", "#f44336", "#e91e63", "#9c27b0", "#673ab7",
      "#3f51b5", "#2196f3", "#03a9f4", "#00bcd4", "#009688", "#4caf50",
      "#8bc34a", "#cddc39", "#ffeb3b", "#ffc107", "#ff9800", "#ff5722",
      "#795548", "#607d8b"
    ]
  };

  const themeOrder = Object.keys(themes);
  let currentThemeIndex = 0;

  // Track two colors for gradients
  let selectedColor1 = "#f44c4e"; // default gradient start color
  let selectedColor2 = "#febf4d"; // default gradient stop color

  // Current fill selection (solid color string or gradient/pattern id)
  let selectedFill = selectedColor1;

  // Update the fill preview rect based on current selectedFill or colors
  function updateFillPreview(fill) {
    if (fill.startsWith("gradient_") || fill.startsWith("pattern_")) {
      fillPreviewRect.setAttribute("fill", `url(#${fill})`);
    } else if (fill.startsWith("url(")) {
      fillPreviewRect.setAttribute("fill", fill);
    } else {
      fillPreviewRect.setAttribute("fill", fill);
    }
  }

  // Update gradient stops dynamically
  function updateGradientColors(id, color1, color2) {
    const grad = document.getElementById(id);
    if (!grad) return;

    const stops = grad.querySelectorAll('stop');
    if (stops.length >= 2) {
      stops[0].setAttribute('stop-color', color1);
      stops[1].setAttribute('stop-color', color2);
    }
  }

  // Initialize first Pickr (for first gradient color or solid color)
  const pickr1 = Pickr.create({
    el: '#pickr-container',
    theme: 'classic',
    default: selectedColor1,
    swatches: themes.base,
    components: {
      preview: true,
      opacity: false,
      hue: true,
      interaction: { hex: true, input: true, save: true }
    }
  });

  // Initialize second Pickr (for second gradient color)
  const pickr2 = Pickr.create({
    el: '#pickr-container-2',
    theme: 'classic',
    default: selectedColor2,
    swatches: themes.base,
    components: {
      preview: true,
      opacity: false,
      hue: true,
      interaction: { hex: true, input: true, save: true }
    }
  });

  // On color1 change/save
pickr1.on('change', (color) => {
  selectedColor1 = color.toHEXA().toString();

  if (selectedFill.startsWith("gradient_")) {
    updateGradientColors(selectedFill, selectedColor1, selectedColor2);
    updateFillPreview(selectedFill);
  } else if (selectedFill.startsWith("pattern_")) {
    updatePatternColors(selectedFill, selectedColor1, selectedColor2);
    updateFillPreview(selectedFill);
  } else {
    selectedFill = selectedColor1;
    updateFillPreview(selectedFill);
  }
});

  pickr1.on('save', () => pickr1.hide());

  // On color2 change/save
pickr2.on('change', (color) => {
  selectedColor2 = color.toHEXA().toString();

  if (selectedFill.startsWith("gradient_")) {
    updateGradientColors(selectedFill, selectedColor1, selectedColor2);
    updateFillPreview(selectedFill);
  } else if (selectedFill.startsWith("pattern_")) {
    updatePatternColors(selectedFill, selectedColor1, selectedColor2);
    updateFillPreview(selectedFill);
  }
});

  pickr2.on('save', () => pickr2.hide());

  function renderSwatches(colors) {
    swatchesContainer.innerHTML = '';
    colors.forEach(color => {
      const swatch = document.createElement('div');
      swatch.className = 'color';
      swatch.style.backgroundColor = color;
      swatch.addEventListener('click', () => {
        selectedFill = color;
        selectedColor1 = color;
        pickr1.setColor(color);
        updateFillPreview(selectedFill);
      });
      swatchesContainer.appendChild(swatch);
    });
  }

  colorThemeBtn.addEventListener('click', () => {
    currentThemeIndex = (currentThemeIndex + 1) % themeOrder.length;
    const themeName = themeOrder[currentThemeIndex];
    renderSwatches(themes[themeName]);
    colorThemeBtn.textContent = `« ${themeName[0].toUpperCase() + themeName.slice(1)} »`;
  });

  renderSwatches(themes.base);

  // Apply fill on shape click
  const shapes = document.querySelectorAll('#svgDrawing path, #svgDrawing rect, #svgDrawing circle, #svgDrawing polygon');
  shapes.forEach(el => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => {
      if (selectedFill.startsWith("gradient_") || selectedFill.startsWith("pattern_")) {
        el.setAttribute("fill", `url(#${selectedFill})`);
      } else if (selectedFill.startsWith("url(")) {
        el.setAttribute("fill", selectedFill);
      } else {
        el.setAttribute("fill", selectedFill);
      }
    });
  });

  // Clear button resets fills
  document.getElementById('clearBtn').onclick = () => {
    shapes.forEach(el => el.removeAttribute("fill"));
  };

  // When a gradient or pattern fill is clicked in the fill samples
  document.querySelectorAll('.patternSample').forEach(sample => {
    sample.addEventListener('click', () => {
      const fill = sample.getAttribute('data-fill');
      selectedFill = fill;

    if (fill.startsWith("gradient_")) {
      const grad = document.getElementById(fill);
      if (grad) {
        const stops = grad.querySelectorAll('stop');
        if (stops.length >= 2) {
          selectedColor1 = stops[0].getAttribute('stop-color');
          selectedColor2 = stops[1].getAttribute('stop-color');
          pickr1.setColor(selectedColor1);
          pickr2.setColor(selectedColor2);
        }
      }
    } else if (fill.startsWith("pattern_")) {
      const pattern = document.getElementById(fill);
      if (pattern) {
        const rect = pattern.querySelector('rect');
        const circle = pattern.querySelector('circle');
        if (rect && circle) {
          selectedColor1 = circle.getAttribute('fill');
          selectedColor2 = rect.getAttribute('fill');
          pickr1.setColor(selectedColor1);
          pickr2.setColor(selectedColor2);
        }
      }
    } else {
      selectedColor1 = fill;
      pickr1.setColor(selectedColor1);
    }


      updateFillPreview(fill);
    });
  });
};

function updatePatternColors(id, color1, color2) {
  const pattern = document.getElementById(id);
  if (!pattern) return;

  const children = pattern.children;

  // Assumes background is rect and dots are circle
  for (const el of children) {
    if (el.tagName === 'rect') {
      el.setAttribute('fill', color2); // background
    } else if (el.tagName === 'circle') {
      el.setAttribute('fill', color1); // dots
    }
  }
}
