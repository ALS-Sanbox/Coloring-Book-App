window.SVGColoringWidget = (function() {
  
  class ColoringWidget {
    constructor(container, options = {}) {
      this.container = typeof container === 'string' ? document.querySelector(container) : container;
      this.options = {
        width: '100%',
        height: '100%',
        sidebarWidth: '300px',
		display: 'flex',
        ...options
      };
      
      this.currentMode = 'solid';
      this.svgDoc = null;
      this.zoomLevel = 1;
      this.gradientType = 'linear';
      this.gradientAngle = 0;
      this.patternCache = {};
      this.selectedPattern = null;
      
      this.palettes = {
        base: ['#f44336','#e91e63','#9c27b0','#673ab7','#3f51b5','#2196f3','#03a9f4','#00bcd4','#009688','#4caf50','#8bc34a','#cddc39','#ffeb3b','#ffc107','#ff9800','#ff5722'],
        pastels: ['#FFB3BA','#FFDFBA','#FFFFBA','#BAFFC9','#BAE1FF','#D7BAFF','#FFC3E6','#E0F7FA','#FFD6A5','#C1E1C1','#F6E2B3','#D3C4E3','#F3E5AB','#B0E0E6','#F5C6AA','#E6E6FA'],
        brights: ['#e6194b','#3cb44b','#ffe119','#4363d8','#f58231','#911eb4','#46f0f0','#f032e6','#bcf60c','#fabebe','#008080','#e6beff','#9a6324','#fffac8','#800000','#aaffc3']
      };
      
      this.demoPatterns = {
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
        </svg>`,
        'zigzag': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <rect width="20" height="20" fill="currentColor1"/>
          <path d="M0,10 L5,5 L10,10 L15,5 L20,10 L20,20 L0,20 Z" fill="currentColor2"/>
        </svg>`,
        'triangles': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <rect width="20" height="20" fill="currentColor1"/>
          <polygon points="10,2 18,18 2,18" fill="currentColor2"/>
        </svg>`
      };
      
      this.init();
    }
    
    init() {
      this.createHTML();
      this.bindEvents();
      this.initializePalette();
      this.initializePatterns();
      this.updateGradientButtons();
    }
    
    createHTML() {
      this.container.innerHTML = `
        <div class="svg-coloring-widget" style="width: ${this.options.width}; height: ${this.options.height}; display: ${this.options.display};">
          <div class="sidebar" style="width: ${this.options.sidebarWidth};">
            <h3 style="margin-top: 0; color: #333;">Coloring Controls</h3>
            
            <div class="control-group">
              <label>Load SVG:</label>
              <input type="file" class="svg-file-input" accept=".svg">
            </div>
            
            <div class="control-group">
              <label>Fill Mode:</label>
              <div class="mode-buttons">
                <div class="mode-button selected" data-mode="solid" title="Solid Fill">
                  <svg width="20" height="20" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" fill="#333"/></svg>
                </div>
                <div class="mode-button" data-mode="gradient" title="Gradient Fill">
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <defs><linearGradient id="iconGrad"><stop offset="0%" stop-color="#f00"/><stop offset="100%" stop-color="#00f"/></linearGradient></defs>
                    <rect x="4" y="4" width="16" height="16" fill="url(#iconGrad)"/>
                  </svg>
                </div>
                <div class="mode-button" data-mode="pattern" title="Pattern Fill">
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <defs><pattern id="iconPat" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="#ccc"/><circle cx="2" cy="2" r="1" fill="#333"/></pattern></defs>
                    <rect x="4" y="4" width="16" height="16" fill="url(#iconPat)"/>
                  </svg>
                </div>
              </div>
            </div>

            <div class="solid-controls control-group">
              <div class="palette-group control-group">
                <label>Select Palette:</label>
                <div class="palette-buttons">
                  <div class="palette-button selected" data-palette="base">Base</div>
                  <div class="palette-button" data-palette="pastels">Pastels</div>
                  <div class="palette-button" data-palette="brights">Brights</div>
                </div>
                <div class="swatch-container"></div>
              </div>    
              <label>Solid Color:</label>
              <input type="color" class="color-solid" value="#ff0000">
            </div>
            
            <div class="gradient-controls control-group" style="display:none;">
              <label>Gradient Colors:</label><br>
              <input type="color" class="color-grad1" value="#ffffff" style="margin-right: 10px;">
              <input type="color" class="color-grad2" value="#e91e63">
              <div class="gradient-buttons">
                <div class="gradient-button" data-type="linear" data-angle="0"></div>
                <div class="gradient-button" data-type="linear" data-angle="180"></div>
                <div class="gradient-button" data-type="linear" data-angle="90"></div>
                <div class="gradient-button" data-type="linear" data-angle="-90"></div>
                <div class="gradient-button" data-type="linear" data-angle="45"></div>
                <div class="gradient-button" data-type="linear" data-angle="-45"></div>
                <div class="gradient-button" data-type="linear" data-angle="30"></div>
                <div class="gradient-button" data-type="linear" data-angle="-30"></div>
                <div class="gradient-button" data-type="radial"></div>
              </div>
            </div>
            
            <div class="pattern-controls control-group" style="display:none;">
              <label>Pattern Colors:</label><br>
              <input type="color" class="pattern-color1" value="#eeeeee" title="Background Color" style="margin-right: 10px;">
              <input type="color" class="pattern-color2" value="#333333" title="Foreground Color">
              <label class="range-label">Pattern Scale: <span class="scale-value">40</span>px</label>
              <input type="range" class="pattern-scale" min="5" max="200" value="40"><br>
              <label>Pattern Type:</label>
              <div class="pattern-buttons"></div>
            </div>
            
            <div class="info-text">
              Click any region in the SVG to apply the selected fill.
            </div>
          </div>
          
          <div class="viewer">
            <div class="zoom-controls">
              <button class="zoom-in" title="Zoom In">+</button>
              <button class="zoom-out" title="Zoom Out">−</button>
              <button class="reset-zoom" title="Reset Zoom">⌂</button>
            </div>
            <div class="svg-container"></div>
          </div>
        </div>
      `;
    }
    
    bindEvents() {
      const widget = this.container.querySelector('.svg-coloring-widget');
      
      // File input
      const fileInput = widget.querySelector('.svg-file-input');
      fileInput.addEventListener('change', (e) => this.handleFileLoad(e));
      
      // Mode buttons
      const modeButtons = widget.querySelectorAll('.mode-button');
      modeButtons.forEach(btn => {
        btn.addEventListener('click', () => this.setMode(btn.dataset.mode));
      });
      
      // Zoom controls
      widget.querySelector('.zoom-in').addEventListener('click', () => this.zoomIn());
      widget.querySelector('.zoom-out').addEventListener('click', () => this.zoomOut());
      widget.querySelector('.reset-zoom').addEventListener('click', () => this.resetZoom());
      
      // Gradient controls
      widget.querySelector('.color-grad1').addEventListener('input', () => this.updateGradientButtons());
      widget.querySelector('.color-grad2').addEventListener('input', () => this.updateGradientButtons());
      
      // Pattern controls
      widget.querySelector('.pattern-color1').addEventListener('input', () => this.updatePatternPreviews());
      widget.querySelector('.pattern-color2').addEventListener('input', () => this.updatePatternPreviews());
      const patternScale = widget.querySelector('.pattern-scale');
      patternScale.addEventListener('input', () => {
        widget.querySelector('.scale-value').textContent = patternScale.value;
        this.updatePatternPreviews();
      });
      
      // Palette buttons
      const paletteButtons = widget.querySelectorAll('.palette-button');
      paletteButtons.forEach(btn => {
        btn.addEventListener('click', () => this.setPalette(btn.dataset.palette, btn));
      });
    }
    
    handleFileLoad(event) {
      const file = event.target.files[0];
      if (file && file.type === 'image/svg+xml') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const svgContainer = this.container.querySelector('.svg-container');
          svgContainer.innerHTML = e.target.result;
          this.svgDoc = svgContainer.querySelector('svg');
          if (this.svgDoc) {
            this.svgDoc.addEventListener('click', (e) => this.onSvgClick(e));
            this.svgDoc.style.maxWidth = '100%';
            this.svgDoc.style.maxHeight = '100%';
            this.ensureDefs();
          }
        };
        reader.readAsText(file);
      }
    }
    
    setMode(mode) {
      this.currentMode = mode;
      const widget = this.container.querySelector('.svg-coloring-widget');
      
      // Update button states
      widget.querySelectorAll('.mode-button').forEach(btn => btn.classList.remove('selected'));
      widget.querySelector(`[data-mode="${mode}"]`).classList.add('selected');
      
      // Show/hide controls
      widget.querySelector('.solid-controls').style.display = mode === 'solid' ? 'block' : 'none';
      widget.querySelector('.gradient-controls').style.display = mode === 'gradient' ? 'block' : 'none';
      widget.querySelector('.pattern-controls').style.display = mode === 'pattern' ? 'block' : 'none';
    }
    
    onSvgClick(event) {
      if (!this.svgDoc) return;
      const target = event.target;
      if (!['path', 'rect', 'circle', 'polygon', 'ellipse'].includes(target.tagName)) return;
      this.applyFill(target);
    }
    
    ensureDefs() {
      if (!this.svgDoc) return;
      let defs = this.svgDoc.querySelector('defs');
      if (!defs) {
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        this.svgDoc.insertBefore(defs, this.svgDoc.firstChild);
      }
    }
    
    applyFill(element) {
      this.ensureDefs();
      const widget = this.container.querySelector('.svg-coloring-widget');
      
      if (this.currentMode === 'solid') {
        const color = widget.querySelector('.color-solid').value;
        element.setAttribute('fill', color);
      } 
      else if (this.currentMode === 'gradient') {
        const id = `grad-${Date.now()}`;
        const grad = document.createElementNS('http://www.w3.org/2000/svg', 
          this.gradientType === 'radial' ? 'radialGradient' : 'linearGradient');
        grad.setAttribute('id', id);

        if (this.gradientType === 'linear') {
          const angle = parseFloat(this.gradientAngle || 0);
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
        stop1.setAttribute('stop-color', widget.querySelector('.color-grad1').value);
        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', widget.querySelector('.color-grad2').value);
        grad.appendChild(stop1);
        grad.appendChild(stop2);
        this.svgDoc.querySelector('defs').appendChild(grad);
        element.setAttribute('fill', `url(#${id})`);
      }
      else if (this.currentMode === 'pattern' && this.selectedPattern) {
        const id = `pat-${Date.now()}`;
        const cached = this.patternCache[this.selectedPattern];
        if (!cached) return;

        const patternEl = cached.cloneNode(true);
        const bgColor = widget.querySelector('.pattern-color1').value;
        const fgColor = widget.querySelector('.pattern-color2').value;
        const scale = widget.querySelector('.pattern-scale').value;

        this.applyPatternColors(patternEl, bgColor, fgColor, scale);
        patternEl.setAttribute('id', id);

        this.svgDoc.querySelector('defs').appendChild(patternEl);
        element.setAttribute('fill', `url(#${id})`);
      }
    }
    
    applyPatternColors(patternEl, bgColor, fgColor, scale) {
      patternEl.setAttribute('patternUnits', 'userSpaceOnUse');
      patternEl.setAttribute('width', scale);
      patternEl.setAttribute('height', scale);

      const processElement = (el, inheritedFill = null, inheritedStroke = null) => {
        let currentFill = el.getAttribute('fill') || inheritedFill;
        let currentStroke = el.getAttribute('stroke') || inheritedStroke;
        
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

        if (el.tagName === 'g') {
          const groupFill = el.getAttribute('fill');
          if (groupFill && groupFill.includes('currentColor')) {
            currentFill = groupFill === 'currentColor1' ? bgColor : fgColor;
            el.removeAttribute('fill');
          }
        }
        
        Array.from(el.children).forEach(child => {
          processElement(child, currentFill, currentStroke);
        });
      };

      Array.from(patternEl.children).forEach(child => {
        processElement(child);
      });
    }
    
    initializePalette() {
      this.setPalette('base', this.container.querySelector('[data-palette="base"]'));
    }
    
    setPalette(paletteName, button) {
      const widget = this.container.querySelector('.svg-coloring-widget');
      
      // Update button states
      widget.querySelectorAll('.palette-button').forEach(btn => btn.classList.remove('selected'));
      button.classList.add('selected');
      
      // Update swatches
      const palette = this.palettes[paletteName];
      const container = widget.querySelector('.swatch-container');
      container.innerHTML = '';
      
      palette.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'swatch';
        swatch.style.backgroundColor = color;
        swatch.addEventListener('click', () => {
          widget.querySelector('.color-solid').value = color;
          widget.querySelectorAll('.swatch').forEach(s => s.classList.remove('selected'));
          swatch.classList.add('selected');
        });
        container.appendChild(swatch);
      });
    }
    
    updateGradientButtons() {
      const widget = this.container.querySelector('.svg-coloring-widget');
      const color1 = widget.querySelector('.color-grad1').value;
      const color2 = widget.querySelector('.color-grad2').value;
      
      widget.querySelectorAll('.gradient-button').forEach(btn => {
        btn.addEventListener('click', () => {
          widget.querySelectorAll('.gradient-button').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          this.gradientType = btn.dataset.type;
          this.gradientAngle = btn.dataset.angle || 0;
        });
        
        if (btn.dataset.type === 'linear') {
          const angle = btn.dataset.angle || '0';
          btn.style.background = `linear-gradient(${angle}deg, ${color1}, ${color2})`;
        } else {
          btn.style.background = `radial-gradient(circle, ${color1}, ${color2})`;
        }
      });
    }
    
    initializePatterns() {
      const widget = this.container.querySelector('.svg-coloring-widget');
      const patternContainer = widget.querySelector('.pattern-buttons');
      
      // Load demo patterns
      Object.keys(this.demoPatterns).forEach(patternName => {
        const btn = document.createElement('div');
        btn.className = 'pattern-button';
        btn.dataset.pattern = patternName;

        const svgPreview = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgPreview.setAttribute('width', '100%');
        svgPreview.setAttribute('height', '100%');
        svgPreview.setAttribute('viewBox', '0 0 100 100');
        btn.appendChild(svgPreview);
        patternContainer.appendChild(btn);

        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(this.demoPatterns[patternName], 'image/svg+xml');
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
        Array.from(svgEl.children).forEach(child => {
          const clone = child.cloneNode(true);
          patternEl.appendChild(clone);
        });

        this.patternCache[patternName] = patternEl;

        // Create preview
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const previewPattern = patternEl.cloneNode(true);
        previewPattern.setAttribute('id', `preview-${patternName}`);
        
        // Apply initial colors
        this.applyPatternColors(previewPattern, 
          widget.querySelector('.pattern-color1').value, 
          widget.querySelector('.pattern-color2').value, 100);
        
        defs.appendChild(previewPattern);
        svgPreview.appendChild(defs);

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', '100%');
        rect.setAttribute('height', '100%');
        rect.setAttribute('fill', `url(#preview-${patternName})`);
        svgPreview.appendChild(rect);

        btn.addEventListener('click', () => {
          widget.querySelectorAll('.pattern-button').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          this.selectedPattern = patternName;
        });
      });
    }
    
    updatePatternPreviews() {
      const widget = this.container.querySelector('.svg-coloring-widget');
      const bgColor = widget.querySelector('.pattern-color1').value;
      const fgColor = widget.querySelector('.pattern-color2').value;
      const scale = widget.querySelector('.pattern-scale').value;

      widget.querySelectorAll('.pattern-button').forEach(btn => {
        const patternName = btn.dataset.pattern;
        const svg = btn.querySelector('svg');
        if (!svg) return;

        const pattern = svg.querySelector('pattern');
        if (!pattern) return;

        // Get fresh copy from cache and apply colors
        const original = this.patternCache[patternName];
        if (!original) return;

        const patternClone = original.cloneNode(true);
        patternClone.setAttribute('id', `preview-${patternName}`);
        this.applyPatternColors(patternClone, bgColor, fgColor, scale);

        // Replace the old pattern
        const defs = svg.querySelector('defs');
        defs.innerHTML = '';
        defs.appendChild(patternClone);
      });
    }
    
    zoomIn() {
      this.zoomLevel *= 1.2;
      this.updateZoom();
    }
    
    zoomOut() {
      this.zoomLevel /= 1.2;
      this.updateZoom();
    }
    
    resetZoom() {
      this.zoomLevel = 1;
      this.updateZoom();
    }
    
    updateZoom() {
      const container = this.container.querySelector('.svg-container');
      container.style.transform = `scale(${this.zoomLevel})`;
    }
    
    // Public API methods
    loadSVG(svgContent) {
      const svgContainer = this.container.querySelector('.svg-container');
      svgContainer.innerHTML = svgContent;
      this.svgDoc = svgContainer.querySelector('svg');
      if (this.svgDoc) {
        this.svgDoc.addEventListener('click', (e) => this.onSvgClick(e));
        this.svgDoc.style.maxWidth = '100%';
        this.svgDoc.style.maxHeight = '100%';
        this.ensureDefs();
      }
    }
    
    getSVG() {
      return this.svgDoc ? this.svgDoc.outerHTML : null;
    }
    
    setFillMode(mode) {
      if (['solid', 'gradient', 'pattern'].includes(mode)) {
        this.setMode(mode);
      }
    }
    
    destroy() {
      this.container.innerHTML = '';
    }
  }
  
  // Static methods for the widget
  return {
    init: function(container, options) {
      return new ColoringWidget(container, options);
    },
    
    // Auto-initialize all elements with data-svg-coloring attribute
    autoInit: function() {
      document.querySelectorAll('[data-svg-coloring]').forEach(el => {
        const options = {};
        if (el.dataset.width) options.width = el.dataset.width;
        if (el.dataset.height) options.height = el.dataset.height;
        if (el.dataset.sidebarWidth) options.sidebarWidth = el.dataset.sidebarWidth;
        
        new ColoringWidget(el, options);
      });
    }
  };
})();

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', SVGColoringWidget.autoInit);
} else {
  SVGColoringWidget.autoInit();
}
