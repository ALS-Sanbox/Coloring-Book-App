let currentMode = 'solid';
let svgDoc = null;
let zoomLevel = 1;

const svgContainer = document.getElementById('svgContainer');
const svgFileInput = document.getElementById('svgFile');

// Initialize solid mode as selected
document.getElementById('modeSolid').classList.add('selected');

const modeButtons = document.querySelectorAll('.mode-button');
modeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    modeButtons.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    currentMode = btn.dataset.mode;
    document.getElementById('solidControls').style.display = currentMode === 'solid' ? 'block' : 'none';
    document.getElementById('gradientControls').style.display = currentMode === 'gradient' ? 'block' : 'none';
    document.getElementById('patternControls').style.display = currentMode === 'pattern' ? 'block' : 'none';
  });
});

svgFileInput.addEventListener('change', event => {
  const file = event.target.files[0];
  if (file && file.type === 'image/svg+xml') {
    const reader = new FileReader();
    reader.onload = e => {
      svgContainer.innerHTML = e.target.result;
      svgDoc = svgContainer.querySelector('svg');
      svgDoc.addEventListener('click', onSvgClick);
      ensureDefs();
    };
    reader.readAsText(file);
  }
});

function onSvgClick(event) {
  if (!svgDoc) return;
  const target = event.target;
  if (target.tagName !== 'path' && target.tagName !== 'rect' && target.tagName !== 'circle' && target.tagName !== 'polygon') return;
  applyFill(target);
}

function ensureDefs() {
  if (!svgDoc) return;
  let defs = svgDoc.querySelector('defs');
  if (!defs) {
    defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svgDoc.insertBefore(defs, svgDoc.firstChild);
  }
}

// Enhanced pattern color application to handle inheritance from groups
function applyPatternColors(patternEl, bgColor, fgColor, scale) {
  patternEl.setAttribute('patternUnits', 'userSpaceOnUse');
  patternEl.setAttribute('width', scale);
  patternEl.setAttribute('height', scale);

  // Helper function to recursively apply colors with inheritance
  function processElement(el, inheritedFill = null, inheritedStroke = null) {
    // Get element's own fill/stroke or use inherited
    let currentFill = el.getAttribute('fill') || inheritedFill;
    let currentStroke = el.getAttribute('stroke') || inheritedStroke;
    
    // Replace currentColor values
    if (currentFill === 'currentColor1') {
      currentFill = bgColor;
      el.setAttribute('fill', bgColor);
    } else if (currentFill === 'currentColor2') {
      currentFill = fgColor;
      el.setAttribute('fill', fgColor);
    }
    
    if (currentStroke === 'currentColor1') {
      currentStroke = bgColor;
      el.setAttribute('stroke', bgColor);
    } else if (currentStroke === 'currentColor2') {
      currentStroke = fgColor;
      el.setAttribute('stroke', fgColor);
    }

    // For group elements, if they have currentColor, remove it after applying to children
    // but keep the color info for inheritance
    if (el.tagName === 'g') {
      const groupFill = el.getAttribute('fill');
      if (groupFill && groupFill.includes('currentColor')) {
        // Pass the resolved color to children, then remove from group
        currentFill = groupFill === 'currentColor1' ? bgColor : fgColor;
        el.removeAttribute('fill');
      }
    }
    
    // Process children with inheritance
    Array.from(el.children).forEach(child => {
      processElement(child, currentFill, currentStroke);
    });
  }

  // Start processing from root elements
  Array.from(patternEl.children).forEach(child => {
    processElement(child);
  });
}

function applyFill(el) {
  ensureDefs();
  if (currentMode === 'solid') {
    el.setAttribute('fill', document.getElementById('colorSolid').value);
  } else if (currentMode === 'gradient') {
    const id = `grad-${Date.now()}`;
    const grad = document.createElementNS('http://www.w3.org/2000/svg', gradientType === 'radial' ? 'radialGradient' : 'linearGradient');
    grad.setAttribute('id', id);

    if (gradientType === 'linear') {
      const angle = parseFloat(gradientAngle || 0);
      const x1 = 50 - 50 * Math.cos(angle * Math.PI / 180);
      const y1 = 50 - 50 * Math.sin(angle * Math.PI / 180);
      const x2 = 50 + 50 * Math.cos(angle * Math.PI / 180);
      const y2 = 50 + 50 * Math.sin(angle * Math.PI / 180);
      grad.setAttribute('x1', `${x1}%`);
      grad.setAttribute('y1', `${y1}%`);
      grad.setAttribute('x2', `${x2}%`);
      grad.setAttribute('y2', `${y2}%`);
    }

    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', document.getElementById('colorGrad1').value);
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', document.getElementById('colorGrad2').value);
    grad.appendChild(stop1);
    grad.appendChild(stop2);
    svgDoc.querySelector('defs').appendChild(grad);
    el.setAttribute('fill', `url(#${id})`);
  } else if (currentMode === 'pattern') {
    const id = `pat-${Date.now()}`;
    const cached = patternCache[window.selPattern];
    if (!cached) return alert('Pattern not loaded');

    const patternEl = cached.cloneNode(true);
    const bgColor = document.getElementById('patternColor1').value;
    const fgColor = document.getElementById('patternColor2').value;
    const scale = patternScale.value;

    applyPatternColors(patternEl, bgColor, fgColor, scale);
    patternEl.setAttribute('id', id);

    svgDoc.querySelector('defs').appendChild(patternEl);
    el.setAttribute('fill', `url(#${id})`);
  }
}

// Gradient setup
let gradientType = 'linear';
let gradientAngle = 0;

document.querySelectorAll('.gradient-button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.gradient-button').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    gradientType = btn.dataset.type;
    gradientAngle = btn.dataset.angle || 0;
  });
});

function updateGradientButtons() {
  const color1 = document.getElementById('colorGrad1').value;
  const color2 = document.getElementById('colorGrad2').value;
  document.querySelectorAll('.gradient-button').forEach(btn => {
    if (btn.dataset.type === 'linear') {
      const angle = btn.dataset.angle || '0';
      btn.style.background = `linear-gradient(${angle}deg, ${color1}, ${color2})`;
    } else {
      btn.style.background = `radial-gradient(circle, ${color1}, ${color2})`;
    }
  });
}

document.getElementById('colorGrad1').addEventListener('input', updateGradientButtons);
document.getElementById('colorGrad2').addEventListener('input', updateGradientButtons);
updateGradientButtons();

// Palette support
const palettes = {
  base: ['#f44336','#e91e63','#9c27b0','#673ab7','#3f51b5','#2196f3','#03a9f4','#00bcd4','#009688','#4caf50','#8bc34a','#cddc39','#ffeb3b','#ffc107','#ff9800','#ff5722'],
  pastels: ['#FFB3BA','#FFDFBA','#FFFFBA','#BAFFC9','#BAE1FF','#D7BAFF','#FFC3E6','#E0F7FA','#FFD6A5','#C1E1C1','#F6E2B3','#D3C4E3','#F3E5AB','#B0E0E6','#F5C6AA','#E6E6FA'],
  brights: ['#e6194b','#3cb44b','#ffe119','#4363d8','#f58231','#911eb4','#46f0f0','#f032e6','#bcf60c','#fabebe','#008080','#e6beff','#9a6324','#fffac8','#800000','#aaffc3']
};

document.querySelectorAll('.palette-button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.palette-button').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    const pal = palettes[btn.dataset.palette];
    const swatchContainer = document.getElementById('swatchContainer');
    swatchContainer.innerHTML = '';
    pal.forEach(color => {
      const div = document.createElement('div');
      div.className = 'swatch';
      div.style.backgroundColor = color;
      div.addEventListener('click', () => {
        document.getElementById('colorSolid').value = color;
        document.querySelectorAll('.swatch').forEach(s => s.classList.remove('selected'));
        div.classList.add('selected');
      });
      swatchContainer.appendChild(div);
    });
  });
});
document.querySelector('.palette-button[data-palette="base"]').click();

// Zoom controls
document.getElementById('zoomIn').addEventListener('click', () => {
  zoomLevel *= 1.2;
  svgContainer.style.transform = `scale(${zoomLevel})`;
});
document.getElementById('zoomOut').addEventListener('click', () => {
  zoomLevel /= 1.2;
  svgContainer.style.transform = `scale(${zoomLevel})`;
});
document.getElementById('resetZoom').addEventListener('click', () => {
  zoomLevel = 1;
  svgContainer.style.transform = `scale(1)`;
});

// Pattern loading
const patternButtonsContainer = document.getElementById('patternButtons');
const patternCache = {};
const patternScale = document.getElementById('patternScale');
const scaleValue = document.getElementById('scaleValue');

document.getElementById('patternColor1').addEventListener('input', updatePatternPreviews);
document.getElementById('patternColor2').addEventListener('input', updatePatternPreviews);
patternScale.addEventListener('input', () => {
  scaleValue.textContent = patternScale.value;
  updatePatternPreviews();
});

// Create demo patterns since we don't have the patterns folder
const demoPatterns = {
  'dots': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
    <rect width="20" height="20" fill="currentColor1"/>
    <circle cx="10" cy="10" r="3" fill="currentColor2"/>
  </svg>`,
  'stripes': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
    <rect width="10" height="10" fill="currentColor1"/>
    <rect x="0" y="0" width="5" height="10" fill="currentColor2"/>
  </svg>`,
  'checkers': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
    <rect width="20" height="20" fill="currentColor1"/>
    <rect x="0" y="0" width="10" height="10" fill="currentColor2"/>
    <rect x="10" y="10" width="10" height="10" fill="currentColor2"/>
  </svg>`
};

// Load patterns from patterns.json or use demo patterns as fallback
fetch('patterns/patterns.json')
  .then(res => res.json())
  .then(files => {
    files.forEach(file => {
      const patternName = file.replace('.svg', '');
      const btn = document.createElement('div');
      btn.className = 'pattern-button';
      btn.dataset.pattern = patternName;

      const svgPreview = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgPreview.setAttribute('width', '100%');
      svgPreview.setAttribute('height', '100%');
      svgPreview.setAttribute('viewBox', '0 0 100 100');
      btn.appendChild(svgPreview);
      patternButtonsContainer.appendChild(btn);

      fetch(`patterns/${file}`)
        .then(res => res.text())
        .then(svgText => {
          const parser = new DOMParser();
          const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
          const svgEl = svgDoc.querySelector('svg');
          const viewBox = svgEl.getAttribute('viewBox') || '0 0 100 100';

          // Create pattern element
          const patternEl = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
          patternEl.setAttribute('id', `preview-${patternName}`);
          patternEl.setAttribute('patternUnits', 'userSpaceOnUse');
          patternEl.setAttribute('viewBox', viewBox);
          patternEl.setAttribute('width', 100);
          patternEl.setAttribute('height', 100);

          // Clone all children of SVG into pattern
          [...svgEl.children].forEach(child => {
            const clone = child.cloneNode(true);
            patternEl.appendChild(clone);
          });

          patternCache[patternName] = patternEl;

          // Create preview
          const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
          const previewPattern = patternEl.cloneNode(true);
          previewPattern.setAttribute('id', `preview-${patternName}`);
          
          // Apply initial colors
          applyPatternColors(previewPattern, document.getElementById('patternColor1').value, document.getElementById('patternColor2').value, 100);
          
          defs.appendChild(previewPattern);
          svgPreview.appendChild(defs);

          const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          rect.setAttribute('width', '100%');
          rect.setAttribute('height', '100%');
          rect.setAttribute('fill', `url(#preview-${patternName})`);
          svgPreview.appendChild(rect);
        })
        .catch(err => console.error('Error loading pattern:', file, err));

      btn.addEventListener('click', () => {
        document.querySelectorAll('.pattern-button').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        window.selPattern = patternName;
      });
    });
  })
  .catch(err => {
    console.log('patterns.json not found, loading demo patterns');
    // Fallback to demo patterns
    Object.keys(demoPatterns).forEach(patternName => {
      const btn = document.createElement('div');
      btn.className = 'pattern-button';
      btn.dataset.pattern = patternName;

      const svgPreview = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgPreview.setAttribute('width', '100%');
      svgPreview.setAttribute('height', '100%');
      svgPreview.setAttribute('viewBox', '0 0 100 100');
      btn.appendChild(svgPreview);
      patternButtonsContainer.appendChild(btn);

      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(demoPatterns[patternName], 'image/svg+xml');
      const svgEl = svgDoc.querySelector('svg');
      const viewBox = svgEl.getAttribute('viewBox') || '0 0 100 100';

      // Create pattern element
      const patternEl = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
      patternEl.setAttribute('id', `preview-${patternName}`);
      patternEl.setAttribute('patternUnits', 'userSpaceOnUse');
      patternEl.setAttribute('viewBox', viewBox);
      patternEl.setAttribute('width', 100);
      patternEl.setAttribute('height', 100);

      // Clone SVG children into pattern
      [...svgEl.children].forEach(child => {
        const clone = child.cloneNode(true);
        patternEl.appendChild(clone);
      });

      patternCache[patternName] = patternEl;

      // Create preview
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      const previewPattern = patternEl.cloneNode(true);
      previewPattern.setAttribute('id', `preview-${patternName}`);
      
      // Apply initial colors
      applyPatternColors(previewPattern, document.getElementById('patternColor1').value, document.getElementById('patternColor2').value, 100);
      
      defs.appendChild(previewPattern);
      svgPreview.appendChild(defs);

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', '100%');
      rect.setAttribute('height', '100%');
      rect.setAttribute('fill', `url(#preview-${patternName})`);
      svgPreview.appendChild(rect);

      btn.addEventListener('click', () => {
        document.querySelectorAll('.pattern-button').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        window.selPattern = patternName;
      });
    });
  });

function updatePatternPreviews() {
  const bgColor = document.getElementById('patternColor1').value;
  const fgColor = document.getElementById('patternColor2').value;
  const scale = document.getElementById('patternScale').value;

  document.querySelectorAll('.pattern-button').forEach(btn => {
    const patternName = btn.dataset.pattern;
    const svg = btn.querySelector('svg');
    if (!svg) return;

    const pattern = svg.querySelector('pattern');
    if (!pattern) return;

    // Get fresh copy from cache and apply colors
    const original = patternCache[patternName];
    if (!original) return;

    const patternClone = original.cloneNode(true);
    patternClone.setAttribute('id', `preview-${patternName}`);
    applyPatternColors(patternClone, bgColor, fgColor, scale);

    // Replace the old pattern
    const defs = svg.querySelector('defs');
    defs.innerHTML = '';
    defs.appendChild(patternClone);
  });
}
