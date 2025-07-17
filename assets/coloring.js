window.onload = () => {
  let gradCounter = 0;
    let zoomScale = 1;
    const palettes = {
      base: ["#ffffff","#000000","#f44336","#e91e63","#9c27b0","#673ab7","#3f51b5","#2196f3","#03a9f4","#00bcd4","#009688","#4caf50","#8bc34a","#cddc39","#ffeb3b","#ffc107","#ff9800","#ff5722","#795548","#607d8b"],
      grayscale: ["#000000","#333333","#666666","#999999","#CCCCCC","#FFFFFF"],
      brights: ["#FFEB3B","#FFC107","#FF9800","#FF5722","#E91E63","#9C27B0","#673AB7","#3F51B5"]
    };
    let currentPalette = 'base', currentMode = 'solid', svgDoc = null;

    // Palette Buttons
    document.querySelectorAll('.palette-button').forEach(btn => btn.addEventListener('click', () => {
      document.querySelectorAll('.palette-button').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      currentPalette = btn.dataset.palette;
      renderSwatches();
    }));
    document.querySelector('.palette-button[data-palette="base"]').classList.add('selected');
    function renderSwatches() {
      const container = document.getElementById('swatchContainer');
      container.innerHTML = '';
      palettes[currentPalette].forEach(col => {
        const sw = document.createElement('div');
        sw.className = 'swatch';
        sw.style.background = col;
        sw.addEventListener('click', () => {
          document.querySelectorAll('.swatch').forEach(s => s.classList.remove('selected'));
          sw.classList.add('selected');
          document.getElementById('colorSolid').value = col;
        });
        container.appendChild(sw);
      });
    }
    renderSwatches();

    // Mode Buttons
    document.querySelectorAll('.mode-button').forEach(btn => btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-button').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      currentMode = btn.dataset.mode;
      document.getElementById('solidControls').style.display = currentMode === 'solid' ? 'block' : 'none';
      document.getElementById('gradientControls').style.display = currentMode === 'gradient' ? 'block' : 'none';
      document.getElementById('patternControls').style.display = currentMode === 'pattern' ? 'block' : 'none';
      initializeGradient();
      updatePatternPreviews();
    }));
    document.getElementById('modeSolid').classList.add('selected');

    // Gradient Previews & Selection
    const gradBtns = document.querySelectorAll('.gradient-button');
    function updateGradientPreviews() {
      const c1 = document.getElementById('colorGrad1').value;
      const c2 = document.getElementById('colorGrad2').value;
      gradBtns.forEach(btn => {
        if (btn.dataset.type === 'linear') {
          btn.style.background = `linear-gradient(${btn.dataset.angle}deg, ${c1}, ${c2})`;
        } else {
          btn.style.background = `radial-gradient(circle, ${c1}, ${c2})`;
        }
      });
    }
    function initializeGradient() {
      updateGradientPreviews();
      // select first preset by default
      gradBtns.forEach(b => b.classList.remove('selected'));
      const first = gradBtns[0];
      first.classList.add('selected');
      window.selGrad = {
        type: first.dataset.type,
        c1: document.getElementById('colorGrad1').value,
        c2: document.getElementById('colorGrad2').value,
        angle: first.dataset.angle
      };
    }
    document.getElementById('colorGrad1').addEventListener('input', updateGradientPreviews);
    document.getElementById('colorGrad2').addEventListener('input', updateGradientPreviews);
    gradBtns.forEach(btn => btn.addEventListener('click', () => {
      gradBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      window.selGrad = {
        type: btn.dataset.type,
        c1: document.getElementById('colorGrad1').value,
        c2: document.getElementById('colorGrad2').value,
        angle: btn.dataset.angle
      };
    }));

    // Pattern Scale & Previews
    const patternScale = document.getElementById('patternScale');
    const scaleValue = document.getElementById('scaleValue');
    const patBtns = document.querySelectorAll('.pattern-button');
    function updatePatternPreviews() {
      patBtns.forEach(btn => {
        const pattern = btn.dataset.pattern;
        let bg = '';
        const s = patternScale.value;
        if (pattern === 'dots') bg = `repeating-radial-gradient(circle, #ccc, #ccc ${s/5}px, #333 ${s/5}px, #333 ${s/2}px)`;
        else if (pattern === 'stripes') bg = `repeating-linear-gradient(0deg, #ccc, #ccc ${s}px, #333 ${s}px, #333 ${s*2}px)`;
        else bg = `repeating-linear-gradient(45deg, #ccc, #ccc ${s/5}px, #333 ${s/5}px, #333 ${s/2}px)`;
        btn.style.background = bg;
      });
    }
    patternScale.addEventListener('input', () => {
      scaleValue.textContent = patternScale.value;
      updatePatternPreviews();
    });
    patBtns.forEach(btn => btn.addEventListener('click', () => {
      patBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      window.selPattern = btn.dataset.pattern;
    }));
    updatePatternPreviews();

    // Zoom Controls
    document.getElementById('zoomIn').addEventListener('click', () => {
      zoomScale *= 1.2;
      document.getElementById('svgContainer').style.transform = `scale(${zoomScale})`;
    });
    document.getElementById('zoomOut').addEventListener('click', () => {
      zoomScale /= 1.2;
      document.getElementById('svgContainer').style.transform = `scale(${zoomScale})`;
    });
    document.getElementById('resetZoom').addEventListener('click', () => {
      zoomScale = 1;
      document.getElementById('svgContainer').style.transform = `scale(${zoomScale})`;
    });

    // SVG Load & Fill
    document.getElementById('svgFile').addEventListener('change', e => {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        document.getElementById('svgContainer').innerHTML = ev.target.result;
        svgDoc = document.querySelector('#svgContainer svg');
        setupFillOnClick(); ensureDefs();
      };
      reader.readAsText(file);
    });
    function setupFillOnClick() {
      svgDoc.querySelectorAll('path, rect, circle, ellipse, polygon, polyline').forEach(el => {
        el.classList.add('hovered'); el.addEventListener('click', evt => { evt.stopPropagation(); applyFill(el); });
      });
      svgDoc.addEventListener('click', evt => evt.stopPropagation());
    }
    function applyFill(el) {
      ensureDefs();
      if (currentMode === 'solid') el.setAttribute('fill', document.getElementById('colorSolid').value);
      else if (currentMode === 'gradient') {
        const id = `grad-${gradCounter++}`;
        const g = document.createElementNS('http://www.w3.org/2000/svg', window.selGrad.type === 'radial' ? 'radialGradient' : 'linearGradient');
        g.setAttribute('id', id);
        [[0, window.selGrad.c1], [100, window.selGrad.c2]].forEach(([off, col]) => {
          const stop = document.createElementNS('http://www.w3.org/2000/svg','stop'); stop.setAttribute('offset', `${off}%`); stop.setAttribute('stop-color', col); g.appendChild(stop);
        });
        if (window.selGrad.type === 'linear') {
          const a = parseFloat(window.selGrad.angle)*Math.PI/180;
          g.setAttribute('x1', `${50 - Math.cos(a)*50}%`); g.setAttribute('y1', `${50 - Math.sin(a)*50}%`);
          g.setAttribute('x2', `${50 + Math.cos(a)*50}%`); g.setAttribute('y2', `${50 + Math.sin(a)*50}%`);
        }
        svgDoc.querySelector('defs').appendChild(g); el.setAttribute('fill', `url(#${id})`);
      } else {
        const id = `pat-${Date.now()}`;
        const p = document.createElementNS('http://www.w3.org/2000/svg','pattern'); p.setAttribute('id', id);
        p.setAttribute('patternUnits', 'userSpaceOnUse'); p.setAttribute('width', patternScale.value); p.setAttribute('height', patternScale.value);
        const bg = document.createElementNS('http://www.w3.org/2000/svg','rect'); bg.setAttribute('width', patternScale.value); bg.setAttribute('height', patternScale.value); bg.setAttribute('fill', '#eee'); p.appendChild(bg);
        if (window.selPattern === 'dots') { const dot = document.createElementNS('http://www.w3.org/2000/svg','circle'); dot.setAttribute('cx', patternScale.value/2); dot.setAttribute('cy', patternScale.value/2); dot.setAttribute('r', patternScale.value/6); dot.setAttribute('fill', '#333'); p.appendChild(dot); }
        else if (window.selPattern === 'stripes') { const stripe = document.createElementNS('http://www.w3.org/2000/svg','rect'); stripe.setAttribute('width', patternScale.value/2); stripe.setAttribute('height', patternScale.value); stripe.setAttribute('fill', '#333'); p.appendChild(stripe); }
        else { const pathEl = document.createElementNS('http://www.w3.org/2000/svg','path'); pathEl.setAttribute('d', `M0,${patternScale.value} L${patternScale.value},0`); pathEl.setAttribute('stroke', '#333'); pathEl.setAttribute('stroke-width', patternScale.value/20); p.appendChild(pathEl); }
        svgDoc.querySelector('defs').appendChild(p); el.setAttribute('fill', `url(#${id})`);
      }
    }
    function ensureDefs() { if (!svgDoc) return; let defs = svgDoc.querySelector('defs'); if (!defs) { defs = document.createElementNS('http://www.w3.org/2000/svg','defs'); svgDoc.prepend(defs);} }
}
