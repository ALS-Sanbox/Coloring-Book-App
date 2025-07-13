  window.onload = () => {
    const swatchesContainer = document.getElementById("swatchesContainer");
    const colorThemeBtn = document.getElementById("colorThemeBtn");

    const themes = {
        base: [
        "#ffffff", "#000000", "#f44336", "#e91e63", "#9c27b0", "#673ab7",
        "#3f51b5", "#2196f3", "#03a9f4", "#00bcd4", "#009688", "#4caf50",
        "#8bc34a", "#cddc39", "#ffeb3b", "#ffc107", "#ff9800", "#ff5722",
        "#795548", "#607d8b"
        ],
        pastels: [
        "#ffd1dc", "#fcd5ce", "#fff1a6", "#d0f4de", "#c3bef0",
        "#b5ead7", "#a0c4ff", "#ffb3c1", "#f6eac2", "#e2f0cb"
        ],
        grayscale: [
        "#000000", "#222222", "#444444", "#666666", "#888888",
        "#aaaaaa", "#cccccc", "#dddddd", "#eeeeee", "#ffffff"
        ],
        regals: [
        "#4b0082", "#800080", "#6a5acd", "#483d8b", "#2f4f4f",
        "#556b2f", "#8b0000", "#b22222", "#800000", "#708090"
        ],
        brights: [
        "#ff0000", "#ff7f00", "#ffff00", "#00ff00", "#0000ff",
        "#4b0082", "#9400d3", "#ff1493", "#00ffff", "#7fff00"
        ],
        subtles: [
        "#f5f5dc", "#e0eee0", "#d8bfd8", "#f0fff0", "#f0ffff",
        "#fafad2", "#ffe4e1", "#f0f8ff", "#f5fffa", "#fff0f5"
        ],
        alphabet: [
        "#ff0000", "#ff7f00", "#ffff00", "#00ff00", "#0000ff",
        "#4b0082", "#9400d3", "#ffa500", "#800080", "#00ffff",
        "#ff69b4", "#a52a2a", "#7fff00", "#d2691e", "#ff4500",
        "#2e8b57", "#da70d6", "#5f9ea0", "#9acd32", "#6495ed",
        "#ff1493", "#1e90ff", "#b22222", "#00fa9a", "#8a2be2",
        "#a52a2a"
        ]
    };

    const themeOrder = Object.keys(themes);
    let currentThemeIndex = 0;
    let selectedColor = "#f44336";

    const pickr = Pickr.create({
      el: '#pickr-container',
      theme: 'classic',
      default: selectedColor,
      swatches: themes.base,
      components: {
        preview: true,
        opacity: false,
        hue: true,
        interaction: {
          hex: true,
          input: true,
          save: true
        }
      }
    });

    pickr.on('save', (color) => {
      selectedColor = color.toHEXA().toString();
      pickr.hide();
    });

    pickr.on('change', (color) => {
      selectedColor = color.toHEXA().toString();
    });

    // Render clickable color swatches
    function renderSwatches(colors) {
      swatchesContainer.innerHTML = '';
      colors.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'color';
        swatch.style.backgroundColor = color;
        swatch.addEventListener('click', () => {
          selectedColor = color;
          pickr.setColor(color);
        });
        swatchesContainer.appendChild(swatch);
      });
    }

    // Handle theme button
    colorThemeBtn.addEventListener('click', () => {
      currentThemeIndex = (currentThemeIndex + 1) % themeOrder.length;
      const themeName = themeOrder[currentThemeIndex];
      renderSwatches(themes[themeName]);
      colorThemeBtn.textContent = `« ${themeName[0].toUpperCase() + themeName.slice(1)} »`;
    });

    renderSwatches(themes.base);

    // Setup coloring
    const shapes = document.querySelectorAll('#svgDrawing path, #svgDrawing rect, #svgDrawing circle, #svgDrawing polygon');
    shapes.forEach(el => {
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => {
        el.style.fill = selectedColor;
      });
    });
  };
